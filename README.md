# davidbingmann.de

My personal website (profile, projects, resume, and an Impressum page).

## How It's Built

- **Frontend**: React + Vite
- **Routing**: React Router (a small SPA with a few routes)
- **Styling**: hand-written CSS (`src/styles.css`) using CSS custom properties and a `data-theme` attribute on `index.html`
- **Icons**: `react-icons`
- **Content**: mostly plain React components; the resume is driven by `src/data/timeline.js`

## How It's Programmed

- `src/main.jsx` renders `<App />`; `src/App.jsx` defines the client-side routes and wraps everything in `src/components/Layout.jsx`.
- `src/components/Layout.jsx` keeps navigation and social links as simple arrays and maps them to `NavLink`/`<a>` elements.
- `src/pages/Home.jsx` implements the hero "typed command" effect with a small `useEffect`-driven timer (typing, then hiding the prompt).
- `src/pages/Resume.jsx` renders the timeline by mapping `timelineItems`; each item sets a CSS variable (`--delay`) for a staggered reveal animation.

## Code Layout

- `index.html`: HTML shell (loads the font, sets the initial theme, mounts `#root`)
- `src/main.jsx`: React entry point (renders `<App />` and imports global styles)
- `src/App.jsx`: route table (`/`, `/projects`, `/resume`, `/impressum`)
- `src/components/Layout.jsx`: shared page chrome (nav + footer + `<Outlet />`)
- `src/pages/*`: page components
- `src/data/timeline.js`: resume timeline data
- `src/assets/*` and `public/*`: images and static assets (e.g. `favicon.ico`)

## Hosting Files (Descriptive)

This repo also keeps the hosting setup I use for the site:

- `Dockerfile`: builds the Vite app and serves it via Vite's preview server
- `docker-compose.yml`: wires the app container to Caddy (plus Watchtower)
- `Caddyfile`: reverse-proxy + compression + a small set of security headers
