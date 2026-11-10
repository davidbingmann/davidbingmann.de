# davidbingmann.de

My personal website: a single-page profile (about, timeline, publications,
projects, posts) plus detail pages, an Impressum page and a password-protected
admin panel at `/admin`.

## How It's Built

- **Frontend**: React + Vite
- **Routing**: React Router (home page, sub pages, and the lazily loaded admin panel)
- **Styling**: hand-written CSS (`src/styles.css`). Light or dark, following
  the reader's system setting; no web fonts, no CSS framework, no scroll
  animations. A single 860px column set in a serif (Charter, falling back to
  Georgia), with the plain-document structure of karpathy.ai: head, timeline,
  publications, projects.
- **Icons**: `react-icons`
- **Content**: `src/data/timeline.jsx` (career timeline), and
  `src/content/projects.json` and `src/content/posts.json`, which the admin
  panel edits. Bodies are Markdown, rendered with `marked`.

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
- **Projects and publications** (`src/content/projects.json`): `type:
  'software'` entries render in the projects section, `type: 'paper'` entries
  in publications (papers also carry a `venue`). `link` is the repo, store or
  PDF the entry points at, and it appears only on the detail page at
  `/projects/<slug>`, not in the home page preview. `body` is the Markdown text
  of that page. The order in the file is the order on the home page.
- **Posts** (`src/content/posts.json`): `slug`, `title`, `date`
  (`YYYY-MM-DD`), optional `summary`, Markdown `body`; shown newest first under
  "Posts" on the home page and at `/posts/<slug>`. The section is hidden while
  there are none.

Both JSON files are normally edited through the admin panel, which commits
them straight to `main`. Pull before editing them by hand.

## Code Layout

- `index.html`: HTML shell (mounts `#root`)
- `src/main.jsx`: React entry point (renders `<App />` and imports global styles)
- `src/App.jsx`: route table (`/`, `/projects/:slug`, `/posts/:slug`, `/impressum`, `/admin/*`)
- `src/components/Layout.jsx`: the page container, shared footer and `<Outlet />`
- `src/components/BackLink.jsx`: the way back to the home page from a sub page
- `src/components/ExternalLink.jsx`: outward links, opened in a new tab
- `src/components/ScrollToTop.jsx`: resets scroll on navigation, honours anchors
- `src/hooks/useDocumentTitle.js`: sets the tab title
- `src/pages/*`: page components
- `src/pages/admin/*`: the admin panel (statistics, content editor), loaded only on `/admin`
- `src/components/Markdown.jsx`: renders a Markdown body
- `src/data/timeline.jsx`: timeline content
- `src/content/*`: projects, publications and posts
- `src/assets/*` and `public/*`: images and static assets (e.g. `favicon.ico`)

## Hosting Files (Descriptive)

This repo also keeps the hosting setup I use for the site:

- `Dockerfile`: builds the Vite app and serves the static result with Caddy (`docker/Caddyfile`)
- `docker-compose.yml`: wires the app container to the host Caddy, plus Watchtower and the Semestral feedback service
- `Caddyfile`: the host's reverse proxy: TLS, compression, security headers, no access log, the `/api/semestral/feedback` and `/api/insights/hit` routes, and the admin panel behind Authelia's `forward_auth`
- `insights-service/`: the page-view counter behind the admin panel's statistics (standard-library Python, SQLite in the `insights_data` volume). `src/components/ViewBeacon.jsx` reports each route change to it, and it adds one to that page's counter for the day and for the hour (hours are kept two days). Only `/api/insights/hit` is public; the numbers are at `/api/admin/insights`, behind the admin login. It deliberately records nothing about the visitor (no IP, no User-Agent, no unique visitors): that is the plain counting the DSK guidance for digital services describes (para. 88), and anything more would bring the §25 TDDDG consent question back. Locally: `DB_PATH=./insights.db uv run --no-project --python 3.12 insights-service/app.py` next to `npm run dev`, which proxies `/api/insights` and `/api/admin/insights` to port 5003
- `authelia/configuration.yml`: the login in front of the admin panel (Authelia, pinned in `docker-compose.yml`); see "Setting Up the Admin Panel on the Server" below. `authelia/prune_auth_log.py` deletes its sign-in records (with IP addresses) after 30 days, as the privacy text says
- `admin-service/`: the admin panel's backend (standard-library Python). It reads `src/content/*.json` from `main`, and each save becomes one commit through the GitHub API: the content file plus the PDFs and images the entry brings along (`public/papers/`, `public/images/`). Picked files stay in the browser until Publish, so a cancelled form publishes nothing; once published, a file stays in the public Git history even after it is deleted; CI and Watchtower then deploy as usual, so an edit is live roughly 5 to 10 minutes later. It accepts writes only with the site's own `Origin`, a second lock next to the login cookie's `SameSite=Lax`, and it shares a Docker network (`admin_net`) with Caddy alone. Locally: `CONTENT_DIR=. ALLOWED_ORIGIN=http://localhost:5173 uv run --no-project --python 3.12 admin-service/app.py` writes into this checkout instead of GitHub, and `npm run dev` proxies `/api/admin` to port 5004 (locally there is no login)
- `feedback-service/`: the Semestral app's feedback endpoint; it reads its SMTP credentials from `.env`, which stays on the server and out of git
- `/semestral`: the Semestral product, privacy and support pages are not in this repo. They live in a separate private repository and run in their own `semestral_site` container, and the host Caddy reverse-proxies `/semestral` to it (see the `@semestral` block and the `semestral_site` service in `docker-compose.yml`)

The server checkout must match this repo. The feedback route and service used to exist only on the server, so pulling an older version of these files there takes the app's feedback form offline.

## Setting Up the Admin Panel on the Server

The panel sits behind Authelia (`authelia/configuration.yml`): a password
first, then a passkey or a 30-second code from an authenticator app. Three
wrong attempts lock the account for ten minutes. Caddy sends every `/admin` and
`/api/admin` request through Authelia before anything else sees it; the login
page itself is at `/auth`.

1. **Secrets**, all under the directory that `SECRETS_DIR` in the server's
   `.env` names (directories 700, files 600, owned by uid 1000):
   - `admin/github_token`: a fine-grained GitHub token for
     `davidbingmann/davidbingmann.de` only, with Contents read/write and
     Actions read, and an expiry date.
   - `authelia/jwt_secret`, `authelia/session_secret`, `authelia/storage_key`:
     one `openssl rand -hex 32` each.
   - `authelia/data/`: an empty directory for Authelia's database (the
     registered passkeys and authenticator secrets, encrypted with
     `storage_key`, and the sign-in records). Back it up together with
     `storage_key`; one is useless without the other.
   - `authelia/users.yml`: the one user. Pick a user name that appears nowhere
     public (the lockout is per user name, so a guessable one lets strangers
     lock you out), a long random password from the password manager, and hash
     it with `docker run --rm -it authelia/authelia:4.39.28 authelia crypto
     hash generate argon2` (it prompts, so the password stays out of the shell
     history):

     ```yaml
     users:
       <user name>:
         displayname: 'David'
         password: '$argon2id$v=19$...'
         email: 'contact@davidbingmann.de'
     ```

2. Merge this into `main` first, so `src/content/*.json` exist on `main` before
   the panel reads them.
3. Fetch `admin-service/`, `authelia/` and the new `insights-service/app.py`
   into the server checkout, add the `auth`, `auth_log_prune` and `admin`
   services, their secrets, the `admin_net` network (only Caddy and `admin`
   join it) and `SECRETS_DIR` in `.env` to the server's `docker-compose.yml`,
   and the `/auth` and admin blocks and the narrowed `/api/insights/hit` route
   to its Caddyfile.
4. `docker compose up -d --build auth auth_log_prune admin insights`; after
   a minute `docker ps` should list `mywebsite_auth` as healthy. (Its log is
   off, because it names the IP of every failed sign-in; to debug a start that
   fails, switch its logging driver to `json-file` for a while.)
5. `docker exec mywebsite_caddy caddy validate --config /etc/caddy/Caddyfile
   --adapter caddyfile`, and only if that passes, `docker compose up -d caddy`.
   Caddy has to be recreated, not just reloaded: a reload cannot attach it to
   the new `admin_net` network, and without it the admin service is out of
   reach. The recreate interrupts every site on the host for a few seconds.
6. Open `https://davidbingmann.de/admin` and sign in with the password. Then
   register both second factors, an authenticator app and a passkey, so losing
   one device does not lock you out. Each registration asks for a one-time code,
   which Authelia writes to a file instead of mailing it:
   `docker exec mywebsite_auth cat /data/notification.txt`.

Locked out by the lockout: `docker exec mywebsite_auth authelia storage bans
user revoke <user name>`. Lost both second factors: `docker exec
mywebsite_auth authelia storage user totp delete <user name>`, then register
again.
