# Terminal Hero — Design

## Goal

Replace the cropped square photo hero on the home page with a macOS-style
terminal window that presents the portrait photo at its natural 2:3 ratio and
absorbs the `about/` section, so the home page is a single coherent element.

## Concept

The home page becomes one terminal session with two commands:

1. `~ $ cd davidbingmann/.` is typed (reusing the existing typing-animation
   idea), then the "output" fades in: photo (left, natural 2:3, ~220px wide)
   and a neofetch-style fact sheet (right): name, role, `study`/`uni`/`work`
   key-value lines (keys in accent yellow), social icon links.
2. `~/davidbingmann $ cat about.txt` is typed, then the existing about prose
   fades in as command output, including the mail link.
3. A final empty prompt `~/davidbingmann $` with a blinking block cursor.

The separate `about/` section below the hero is removed — its facts live in
the fact sheet, its prose in the `cat about.txt` output.

## Visuals

- Whole page stays in the existing dark theme (`#0b0b0b`, already hardcoded
  via `data-theme="dark"`).
- Terminal window: slightly lighter surface (`#141414`), 1px border
  (`#2a2c27`), 12px radius, title bar with macOS traffic lights and
  `david@bingmann.de — zsh` title. On dark backgrounds the window separates
  via surface + border (shadows don't read).
- Colors via `--term-*` CSS variables with a light-theme fallback so the
  light palette keeps working if the theme is ever switched back.
- Prompt cwd in green, `$` muted, fact keys in yellow (`#febc2e`).

## Behavior

- Animation sequence: type cmd 1 → profile output fades in → type cmd 2 →
  about output fades in → final blinking prompt. ~90ms per character,
  short pauses between stages.
- On small screens (≤720px) and `prefers-reduced-motion`: everything renders
  immediately (same policy as the current hero).
- Mobile layout: photo and fact sheet stack vertically inside the terminal.

## Out of scope

- Nav, footer, projects/resume/impressum pages stay unchanged.
- No new dependencies.
