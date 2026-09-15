import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import { fileURLToPath } from 'node:url'

// Force a clean full page reload on every file change instead of hot-module
// replacement. HMR was repeatedly wedging mid-edit (especially on root files),
// leaving the open tab stuck on stale/broken JS, which read as "not responsive".
// A full reload always boots a clean bundle, so the app can never get wedged.
const fullReloadOnChange = {
  name: 'force-full-reload',
  enforce: 'post',
  handleHotUpdate({ server }) {
    server.ws.send({ type: 'full-reload' })
    return []
  },
}

// The lab can regenerate the thirty location photos with their people taken out,
// and those have to land on disk to replace the originals. A browser cannot write
// files, so this dev only endpoint does it: POST /lab-write with { name, dataUrl }.
//
// Deliberately narrow. It only ever writes into public/lab-locations, only accepts
// a slug ending in .jpg, and copies whatever it is about to overwrite into
// with-people/ first, so the originals are never actually lost. It is registered
// for `serve` only, so it does not exist in a build.
const labWrite = {
  name: 'lab-write',
  apply: 'serve',
  configureServer(server) {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const dir = path.resolve(here, 'public/lab-locations')
    const backupDir = path.join(dir, 'with-people')

    server.middlewares.use('/lab-write', async (req, res) => {
      const send = (code, body) => {
        res.statusCode = code
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      }
      if (req.method !== 'POST') { send(405, { error: 'POST only' }); return }
      try {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        // One file or thirty. A batch matters: every write here wakes the file
        // watcher, and a reload halfway through a set would strand the rest.
        const files = Array.isArray(body.files) ? body.files : [body]
        if (!files.length) { send(400, { error: 'Nothing to write' }); return }

        await fs.mkdir(backupDir, { recursive: true })
        const written = []
        const failed = []

        for (const { name, dataUrl } of files) {
          try {
            if (!/^[a-z0-9-]+\.jpg$/.test(String(name || ''))) {
              throw new Error('That is not a location photo name')
            }
            const comma = String(dataUrl || '').indexOf(',')
            if (comma === -1) throw new Error('No image in that request')
            const bytes = Buffer.from(dataUrl.slice(comma + 1), 'base64')
            if (!bytes.length) throw new Error('That image was empty')

            const target = path.join(dir, name)
            if (path.dirname(target) !== dir) throw new Error('Outside the photo folder')

            // The original is only ever copied once, so running this twice cannot
            // overwrite the backup with an already emptied scene.
            const backup = path.join(backupDir, name)
            let backedUp = false
            try {
              await fs.access(backup)
            } catch {
              try { await fs.copyFile(target, backup); backedUp = true } catch { /* nothing there yet */ }
            }

            await fs.writeFile(target, bytes)
            written.push({ name, bytes: bytes.length, backedUp })
          } catch (e) {
            failed.push({ name, error: e.message })
          }
        }

        send(failed.length && !written.length ? 400 : 200, { written, failed })
      } catch (e) {
        send(500, { error: e.message })
      }
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), fullReloadOnChange, labWrite],
  server: {
    // Listen on the port assigned by the harness (via PORT), falling back to
    // Vite's default when run manually.
    port: process.env.PORT ? Number(process.env.PORT) : undefined,
    watch: {
      // The rebuild tool writes thirty files into this folder while it runs, and
      // every write here would otherwise trip the full reload above and kill the
      // sweep after the first one. The new photos show up on the next reload.
      ignored: ['**/public/lab-locations/**'],
    },
    // The photo lab talks to Gemini from the browser. Going through the dev
    // server keeps CORS out of the picture while testing locally.
    proxy: {
      '/gemini-api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/gemini-api/, ''),
      },
    },
  },
})
