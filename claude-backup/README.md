# Claude backup

A snapshot of everything Claude Code knows about this work, taken on 5 Nov 2026.
It is all in one file: `Claude-backup-2026-11-05.zip` (about 3 MB).

## What is inside

- **skills**: the reference skills Claude reads before designing.
  - competitor-patterns: 1,118 competitor screens, sorted by kind of section
  - chatbot-patterns: the research behind Annie, the in-app assistant
  - 30sundays-analytics
  - trailix-api: the Trailix content API, field by field
- **memory**: the notes Claude keeps for each project. These are your rules
  (no em dashes, one pink button, plain plans), the brand system, and the
  history of each feature. There is one folder for each of the 9 projects.
- **instructions**: the working notes (CLAUDE.md) from all 15 project
  folders, the prototype guide, and Claude's settings file.

## How to restore it

1. Unzip the file.
2. Copy `skills` into `~/.claude/skills/`.
3. Copy each folder in `memory` back into its project's memory folder under
   `~/.claude/projects/`. For example, `memory/30sundays-app` goes to
   `~/.claude/projects/-Users-jaiki96-Documents-Claude-code-30sundays-app/memory/`.
4. The working notes in `instructions` are already saved in each project's own
   folder. Copy them back only if a project loses its copy.

This is a snapshot. Anything Claude saves after 5 Nov 2026 is not in it.
