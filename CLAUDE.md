# 30 Sundays app - working notes

## Writing rules (UI copy and code)
- NEVER use em dashes (—) anywhere, ever. Use hyphens, commas, parentheses, or
  separate sentences instead. This applies to UI copy, comments, and docs.
- Keep UI copy short and plain. Avoid jargon.

## Visual rules
- Default to a white background. Do not wrap content in a pink or tinted card
  just to group it. White reads cleaner, and the brand colour lands harder when
  it is used sparingly.
- Keep pink for the things that should be noticed: buttons, icons, kickers,
  small accents. Not for large fills behind body text.

## Plans for this user
- The user is non-technical. Keep plans short and in plain language.
- Never mention file names, code, or file-level changes in a plan. Describe what
  changes for the user and how it behaves, not how it is built.

## Prototype
- React 18 + Vite + React Router. Mobile-first inside a phone frame shell.
- Parallel screen variants are kept on their own routes (e.g. /v3-/v6, /discover,
  /wf, /compare); nothing is merged onto `/` without explicit approval.
- Commit or push only when explicitly asked.

## Where the work lives (two people)
- Kashyap's repo is the one everyone works from: the `kashyap` remote, branch
  `main`. `jaiki96/30sundays-app` is kept only for history.
- Never commit straight to `main`. Every piece of work gets its own branch off
  `kashyap/main`, pushed to `kashyap`, and opened as a pull request for review.
- Pull `kashyap/main` before starting anything, so two people never build on
  different bases.
- New screens keep taking their own route, the way variants always have. Two
  people mean two designs can be live at once, so never overwrite a screen
  someone else may be reviewing.
