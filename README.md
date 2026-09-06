# davidbingmann.de

My personal website: a single-page profile (about, timeline, projects,
publications) plus project detail pages and an Impressum page.

## How It's Built

- **Frontend**: React + Vite
- **Routing**: React Router (home page plus two sub-page routes)
- **Styling**: hand-written CSS (`src/styles.css`). Light or dark, following
  the reader's system setting; no web fonts, no CSS framework, no scroll
  animations. A single 860px column set in a serif (Charter, falling back to
  Georgia), with the plain-document structure of karpathy.ai: head, timeline,
  publications, projects.
- **Icons**: `react-icons`
- **Content**: `src/data/timeline.jsx` (career timeline) and
  `src/data/projects.js` (projects and papers) drive the home page.

## How It's Programmed

- `src/main.jsx` renders `<App />`; `src/App.jsx` defines the routes and wraps
  them in `src/components/Layout.jsx`.
- `src/components/Layout.jsx` is only the shared footer plus an `<Outlet />`;
  there is no navigation bar. Sub-pages carry their own "back" link.
- `src/pages/Home.jsx` renders the whole home document: head (photo, name,
  social icons), the timeline, projects, publications.
- `/projects` and `/resume` redirect to `/`, since both now live on the home
  page.

## Content You Edit By Hand

- **Timeline** (`src/data/timeline.jsx`): each entry has a `year` (the large
  numeral), an optional `until` label under it, an optional `logo`, and a
  `body` written as JSX so it can contain links. Adding an organisation logo
  takes a few steps beyond dropping a file in `src/assets/logos/`; they are
  listed at the top of `src/data/timeline.jsx`, next to the entries themselves.
  Every tile is the same square whatever shape the mark is, and rows have a
  fixed height so the gaps between logos stay identical. Both come from the
  tokens at the top of `src/styles.css` (`--logo-box`, `--logo-gutter`); an
  entry whose text grows past that height falls out of the rhythm on its own.
- **Projects** (`src/data/projects.js`): `type: 'software'` entries render in
  the projects section, `type: 'paper'` entries in publications (papers also
  carry a `venue`). `link` is the repo, store or PDF the entry points at, and
  it appears only on the detail page at `/projects/<slug>`, not in the home
  page preview. `body` is the text of that page.

## Code Layout

- `index.html`: HTML shell (mounts `#root`)
- `src/main.jsx`: React entry point (renders `<App />` and imports global styles)
- `src/App.jsx`: route table (`/`, `/projects/:slug`, `/impressum`)
- `src/components/Layout.jsx`: the page container, shared footer and `<Outlet />`
- `src/components/BackLink.jsx`: the way back to the home page from a sub page
- `src/components/ExternalLink.jsx`: outward links, opened in a new tab
- `src/components/ScrollToTop.jsx`: resets scroll on navigation, honours anchors
- `src/hooks/useDocumentTitle.js`: sets the tab title
- `src/pages/*`: page components
- `src/data/*`: timeline and project content
- `src/assets/*` and `public/*`: images and static assets (e.g. `favicon.ico`)

## Hosting Files (Descriptive)

This repo also keeps the hosting setup I use for the site:

- `Dockerfile`: builds the Vite app and serves it via Vite's preview server
- `docker-compose.yml`: wires the app container to Caddy (plus Watchtower)
- `Caddyfile`: reverse-proxy + compression + a small set of security headers
