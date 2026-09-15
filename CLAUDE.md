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
