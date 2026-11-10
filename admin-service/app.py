"""Backend of the admin panel: reads and saves the site's content.

Saving makes one commit on the repository's main branch through the GitHub API:
the content file, plus any PDFs or images the entry brings along. The usual
pipeline (GitHub Actions, then Watchtower) takes it live. Files are only sent
with the save, so a cancelled form never publishes anything.
With CONTENT_DIR set it writes to a local checkout instead, for development.

Caddy lets a request through only after Authelia has seen a full two-factor
login, and only Caddy shares this service's Docker network; the service does
not check the login again. It does refuse writes from another origin.
"""

import base64
import hashlib
import json
import os
import re
import threading
import traceback
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = int(os.environ.get("PORT", "5004"))
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "https://davidbingmann.de")
GITHUB_REPO = os.environ.get("GITHUB_REPO", "davidbingmann/davidbingmann.de")
GITHUB_BRANCH = os.environ.get("GITHUB_BRANCH", "main")
CONTENT_DIR = os.environ.get("CONTENT_DIR")

COLLECTIONS = {
    "projects": "src/content/projects.json",
    "posts": "src/content/posts.json",
}
# The folder under public/ that each kind of upload lands in.
UPLOAD_FOLDERS = {"pdf": "papers", "png": "images", "jpg": "images", "jpeg": "images", "webp": "images"}
MAX_CONTENT = 2 * 1024 * 1024
MAX_FILE = 20 * 1024 * 1024
# All files of one save together. A save is held in memory a few times over
# (request, decoded files, the blob being sent), and the container has 256 MB.
MAX_FILES_TOTAL = 30 * 1024 * 1024
# A save carries its files base64-encoded in the JSON body.
MAX_REQUEST = MAX_CONTENT + MAX_FILES_TOTAL * 4 // 3 + 64 * 1024

SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
# The panel cleans file names before it sends them; this only checks.
FILE_NAME = re.compile(r"^(?P<stem>[a-z0-9]+(-[a-z0-9]+)*)\.(?P<extension>[a-z]+)$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
# The project link is rendered as a plain <a href>; never javascript: or data:,
# and never `//host` or `/\host`, which browsers read as another site.
LINK = re.compile(r"^(https?://|/(?![/\\]))", re.IGNORECASE)


class Conflict(Exception):
    """The content changed since it was read, or an uploaded file already exists."""


class Invalid(Exception):
    """The submitted content would break the site."""


class Unreadable(Exception):
    """A content file on the branch is not a JSON list, so it cannot be edited safely."""


class GitHubStore:
    def __init__(self, token: str):
        self.token = token

    def _request(self, method: str, url: str, payload: dict | None = None, raw: bool = False):
        data = json.dumps(payload).encode() if payload is not None else None
        request = urllib.request.Request(url, data=data, method=method)
        request.add_header("Authorization", f"Bearer {self.token}")
        request.add_header("Accept", "application/vnd.github.raw+json" if raw else "application/vnd.github+json")
        request.add_header("X-GitHub-Api-Version", "2022-11-28")
        if data is not None:
            request.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.read() if raw else json.load(response)

    def _api(self, path: str) -> str:
        return f"https://api.github.com/repos/{GITHUB_REPO}/{path}"

    def _contents(self, path: str, ref: str) -> dict | None:
        """The file's metadata at that ref, or None if it does not exist there."""
        try:
            return self._request("GET", self._api(f"contents/{urllib.parse.quote(path)}?ref={ref}"))
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None
            raise

    def read(self, path: str) -> tuple[bytes | None, str | None]:
        file = self._contents(path, GITHUB_BRANCH)
        if file is None:
            return None, None
        if file.get("encoding") == "base64":
            return base64.b64decode(file["content"]), file["sha"]
        # Above 1 MB GitHub leaves the content out of this answer; reading it
        # as empty would let the next save wipe the whole collection.
        url = self._api(f"contents/{urllib.parse.quote(path)}?ref={GITHUB_BRANCH}")
        return self._request("GET", url, raw=True), file["sha"]

    def commit(self, files: list[tuple[str, bytes]], sha: str | None, message: str) -> str:
        """One commit: files[0] is the content file, expected at `sha`; the rest
        are new uploads. Returns the content file's new sha."""
        head = self._request("GET", self._api(f"git/ref/heads/{GITHUB_BRANCH}"))["object"]["sha"]
        current = self._contents(files[0][0], head)
        if (current and current["sha"]) != sha:
            raise Conflict(CHANGED)
        for path, _ in files[1:]:
            if self._contents(path, head) is not None:
                raise Conflict(exists(path))
        tree = []
        for path, data in files:
            blob = self._request(
                "POST", self._api("git/blobs"), {"content": base64.b64encode(data).decode(), "encoding": "base64"}
            )
            tree.append({"path": path, "mode": "100644", "type": "blob", "sha": blob["sha"]})
        base_tree = self._request("GET", self._api(f"git/commits/{head}"))["tree"]["sha"]
        new_tree = self._request("POST", self._api("git/trees"), {"base_tree": base_tree, "tree": tree})["sha"]
        new_commit = self._request(
            "POST", self._api("git/commits"), {"message": message, "tree": new_tree, "parents": [head]}
        )["sha"]
        try:
            self._request("PATCH", self._api(f"git/refs/heads/{GITHUB_BRANCH}"), {"sha": new_commit, "force": False})
        except urllib.error.HTTPError as error:
            # 422: main moved on while this commit was being built.
            if error.code == 422:
                raise Conflict(CHANGED) from error
            raise
        return tree[0]["sha"]

    def latest_build(self) -> dict | None:
        url = self._api(f"actions/runs?branch={GITHUB_BRANCH}&event=push&per_page=1")
        runs = self._request("GET", url).get("workflow_runs") or []
        if not runs:
            return None
        run = runs[0]
        return {
            "status": run["status"],
            "conclusion": run["conclusion"],
            "updated_at": run["updated_at"],
            "message": (run.get("head_commit") or {}).get("message", "").split("\n")[0],
            "url": run["html_url"],
        }


class LocalStore:
    """Development stand-in that writes into a checkout on disk."""

    def __init__(self, root: str):
        self.root = Path(root)
        self.lock = threading.Lock()

    def read(self, path: str) -> tuple[bytes | None, str | None]:
        file = self.root / path
        if not file.exists():
            return None, None
        data = file.read_bytes()
        return data, hashlib.sha1(data).hexdigest()

    def commit(self, files: list[tuple[str, bytes]], sha: str | None, message: str) -> str:
        with self.lock:
            if self.read(files[0][0])[1] != sha:
                raise Conflict(CHANGED)
            for path, _ in files[1:]:
                if (self.root / path).exists():
                    raise Conflict(exists(path))
            for path, data in files:
                file = self.root / path
                file.parent.mkdir(parents=True, exist_ok=True)
                temporary = file.with_suffix(file.suffix + ".tmp")
                temporary.write_bytes(data)
                temporary.replace(file)
            print(f"committed {len(files)} file(s): {message}", flush=True)
            return hashlib.sha1(files[0][1]).hexdigest()

    def latest_build(self) -> dict | None:
        return None


CHANGED = "The content changed somewhere else in the meantime. Reload the page and try again."


def served_at(path: str) -> str:
    return "/" + path.removeprefix("public/")


def exists(path: str) -> str:
    return f"{served_at(path)} already exists. Rename the file and add it again."


def open_store():
    if CONTENT_DIR:
        return LocalStore(CONTENT_DIR)
    token_file = os.environ.get("GITHUB_TOKEN_FILE")
    token = Path(token_file).read_text().strip() if token_file else os.environ["GITHUB_TOKEN"]
    return GitHubStore(token)


store = open_store()


# Validation: whatever is saved here is built into the site as is.


def text(entry: dict, key: str, required: bool = True, limit: int = 300) -> str:
    value = entry.get(key, "")
    if not isinstance(value, str):
        raise Invalid(f"“{key}” must be text.")
    value = value.strip()
    if required and not value:
        raise Invalid(f"“{entry.get('title') or 'An entry'}” needs a {key}.")
    if len(value) > limit:
        raise Invalid(f"The {key} of “{entry.get('title')}” is longer than {limit} characters.")
    return value


def clean_project(entry: dict) -> dict:
    kind = entry.get("type")
    if kind not in ("software", "paper"):
        raise Invalid("Every entry must be a project or a publication.")
    link = entry.get("link") or {}
    if not isinstance(link, dict):
        raise Invalid("The link must have an address and a label.")
    clean = {
        "slug": text(entry, "slug", limit=80),
        "title": text(entry, "title"),
        "type": kind,
    }
    if kind == "paper":
        clean["venue"] = text(entry, "venue")
    clean["headline"] = text(entry, "headline")
    href = text(link, "href", required=False, limit=500)
    if kind == "paper" and not href:
        raise Invalid(f"“{clean['title']}” needs a link to the paper or its PDF.")
    if href and not LINK.match(href):
        raise Invalid(
            f"The link of “{clean['title']}” must start with https:// or be a path on this site like /papers/…."
        )
    if href:
        # An empty label is kept empty; the pages show the address instead.
        clean["link"] = {"href": href, "label": text(link, "label", required=False)}
    if kind == "software":
        clean["summary"] = text(entry, "summary", limit=1000)
    clean["body"] = text(entry, "body", required=False, limit=200_000)
    return clean


def is_real_date(text: str) -> bool:
    try:
        date.fromisoformat(text)
    except ValueError:
        return False
    return bool(DATE.match(text))


def clean_post(entry: dict) -> dict:
    clean = {
        "slug": text(entry, "slug", limit=80),
        "title": text(entry, "title"),
        "date": text(entry, "date", limit=10),
        "summary": text(entry, "summary", required=False, limit=1000),
        "body": text(entry, "body", limit=200_000),
    }
    if not is_real_date(clean["date"]):
        raise Invalid(f"The date of “{clean['title']}” must be a real date written like 2026-11-10.")
    return clean


def clean_collection(name: str, items) -> list[dict]:
    if not isinstance(items, list) or not all(isinstance(entry, dict) for entry in items):
        raise Invalid("The content must be a list of entries.")
    clean = [clean_project(e) if name == "projects" else clean_post(e) for e in items]
    seen = set()
    for entry in clean:
        if not SLUG.match(entry["slug"]):
            raise Invalid(f"The URL name “{entry['slug']}” may only use a–z, 0–9 and single hyphens.")
        if entry["slug"] in seen:
            raise Invalid(f"Two entries share the URL name “{entry['slug']}”.")
        seen.add(entry["slug"])
    return clean


def clean_uploads(files) -> list[tuple[str, bytes]]:
    """The files a save brings along, as (path in the repo, content)."""
    if not files:
        return []
    if not isinstance(files, list):
        raise Invalid("The files did not arrive intact. Add them again.")
    uploads, total = [], 0
    for file in files:
        name = file.get("name") if isinstance(file, dict) else None
        match = FILE_NAME.match(name or "")
        if not match or len(match["stem"]) > 80 or match["extension"] not in UPLOAD_FOLDERS:
            raise Invalid(f"The file name {name} is not usable; rename the file and add it again.")
        path = f"public/{UPLOAD_FOLDERS[match['extension']]}/{name}"
        if any(path == other for other, _ in uploads):
            raise Invalid(f"{name} was added twice.")
        try:
            data = base64.b64decode(file.get("data") or "", validate=True)
        except ValueError as error:
            raise Invalid(f"{name} did not arrive intact. Add it again.") from error
        total += len(data)
        if not data or len(data) > MAX_FILE:
            raise Invalid(f"{name} must be smaller than {MAX_FILE // (1024 * 1024)} MB.")
        if total > MAX_FILES_TOTAL:
            raise Invalid(f"The files of one save must stay under {MAX_FILES_TOTAL // (1024 * 1024)} MB together.")
        uploads.append((path, data))
    return uploads


def github_error(code: int) -> str:
    if code in (401, 403):
        return (
            f"GitHub refused the request ({code}). The token on the server may have expired "
            "or be missing a permission (Contents read/write, Actions read)."
        )
    if code == 404:
        return f"GitHub could not find {GITHUB_REPO} or its {GITHUB_BRANCH} branch with this token."
    return f"GitHub answered with an error ({code}). Try again shortly."


def read_collection(path: str) -> dict:
    data, sha = store.read(path)
    if data is None:
        return {"items": [], "sha": None}
    try:
        items = json.loads(data)
    except ValueError:
        items = None
    if not isinstance(items, list):
        raise Unreadable(f"{path} on {GITHUB_BRANCH} is not a valid JSON list. Fix it in the repository, then reload.")
    return {"items": items, "sha": sha}


class AdminHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        route = urllib.parse.urlsplit(self.path).path.rstrip("/")
        if route == "/api/admin/content":
            try:
                with ThreadPoolExecutor(len(COLLECTIONS)) as pool:
                    content = dict(zip(COLLECTIONS, pool.map(read_collection, COLLECTIONS.values()), strict=True))
            except Unreadable as error:
                return self._respond(502, {"error": str(error)})
            return self._respond(200, content)
        if route == "/api/admin/build":
            return self._respond(200, {"build": store.latest_build()})
        return self._respond(404, {"error": "Not found."})

    def do_PUT(self):
        route = urllib.parse.urlsplit(self.path).path.rstrip("/")
        name = route.removeprefix("/api/admin/content/")
        if name not in COLLECTIONS:
            return self._respond(404, {"error": "Not found."})
        body = self._read_body()
        if body is None:
            return None
        try:
            payload = json.loads(body)
            del body
            items = clean_collection(name, payload.get("items"))
            # Decoded once; drop the base64 copies so a save with files does
            # not hold every file in memory three times.
            uploads = clean_uploads(payload.pop("files", None))
        except (ValueError, AttributeError):
            return self._respond(400, {"error": "The request is not valid JSON."})
        except Invalid as error:
            return self._respond(422, {"error": str(error)})
        message = str(payload.get("message") or f"Update {name} from the admin panel")[:200]
        data = (json.dumps(items, indent=2, ensure_ascii=False) + "\n").encode()
        if len(data) > MAX_CONTENT:
            return self._respond(413, {"error": "The content is too long to save in one file."})
        try:
            sha = store.commit([(COLLECTIONS[name], data), *uploads], payload.get("sha"), message)
        except Conflict as error:
            return self._respond(409, {"error": str(error)})
        return self._respond(200, {"sha": sha, "items": items})

    def _read_body(self) -> bytes | None:
        # The login cookie is SameSite=Lax, which already keeps it off
        # cross-site writes; this is a second lock that holds even if that
        # cookie setting ever changes.
        if self.headers.get("Origin") != ALLOWED_ORIGIN:
            self._respond(403, {"error": "Writes are only accepted from the admin page."})
            return None
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_REQUEST:
            self._respond(413, {"error": "The save is too large. Leave out some files and try again."})
            return None
        return self.rfile.read(length)

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except urllib.error.HTTPError as error:
            print(f"GitHub answered {error.code}: {error.reason}", flush=True)
            self._respond(502, {"error": github_error(error.code)})
        except (urllib.error.URLError, TimeoutError) as error:
            print(f"GitHub request failed: {error}", flush=True)
            self._respond(502, {"error": "GitHub could not be reached. Try again shortly."})
        except Exception:  # noqa: BLE001 - every request still gets an answer
            traceback.print_exc()
            self._respond(500, {"error": "The admin service ran into an error. Its log has the details."})

    def _respond(self, code: int, payload: dict):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    print(f"admin service listening on :{PORT} ({'local' if CONTENT_DIR else 'GitHub'} storage)", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), AdminHandler).serve_forever()
