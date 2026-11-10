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
# Where an upload lands in the repo, and the URL it is served at once built.
UPLOAD_DIRS = {
    "pdf": ("public/papers", "/papers"),
    "png": ("public/images", "/images"),
    "jpg": ("public/images", "/images"),
    "jpeg": ("public/images", "/images"),
    "webp": ("public/images", "/images"),
}
MAX_CONTENT = 2 * 1024 * 1024
MAX_FILE = 20 * 1024 * 1024
MAX_FILES = 10
# A save carries its files base64-encoded in the JSON body.
MAX_REQUEST = MAX_CONTENT + MAX_FILES * MAX_FILE * 4 // 3 + 64 * 1024

SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
# The project link is rendered as a plain <a href>; never javascript: or data:.
LINK = re.compile(r"^(https?://|/(?!/))", re.IGNORECASE)


class Conflict(Exception):
    """The content changed since it was read, or an uploaded file already exists."""


class Invalid(Exception):
    """The submitted content would break the site."""


class Unreadable(Exception):
    """A content file on the branch is not a JSON list, so it cannot be edited safely."""


# Storage


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

    def _contents_url(self, path: str) -> str:
        return f"https://api.github.com/repos/{GITHUB_REPO}/contents/{urllib.parse.quote(path)}"

    def read(self, path: str) -> tuple[bytes | None, str | None]:
        url = f"{self._contents_url(path)}?ref={GITHUB_BRANCH}"
        try:
            file = self._request("GET", url)
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None, None
            raise
        if file.get("encoding") == "base64":
            return base64.b64decode(file["content"]), file["sha"]
        # Above 1 MB GitHub leaves the content out of this answer; reading it
        # as empty would let the next save wipe the whole collection.
        return self._request("GET", url, raw=True), file["sha"]

    def _api(self, path: str) -> str:
        return f"https://api.github.com/repos/{GITHUB_REPO}/{path}"

    def _sha_at(self, path: str, ref: str) -> str | None:
        try:
            return self._request("GET", f"{self._contents_url(path)}?ref={ref}")["sha"]
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None
            raise

    def commit(self, path: str, data: bytes, sha: str | None, uploads: list, message: str) -> str:
        """One commit with the content file and the uploads; returns the content file's new sha."""
        head = self._request("GET", self._api(f"git/ref/heads/{GITHUB_BRANCH}"))["object"]["sha"]
        if self._sha_at(path, head) != sha:
            raise Conflict(CHANGED)
        for upload_path, served_at, _ in uploads:
            if self._sha_at(upload_path, head) is not None:
                raise Conflict(exists(served_at))
        tree = []
        for file_path, file_data in [(path, data), *[(p, d) for p, _, d in uploads]]:
            blob = self._request(
                "POST", self._api("git/blobs"), {"content": base64.b64encode(file_data).decode(), "encoding": "base64"}
            )
            tree.append({"path": file_path, "mode": "100644", "type": "blob", "sha": blob["sha"]})
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
        url = f"https://api.github.com/repos/{GITHUB_REPO}/actions/runs?branch={GITHUB_BRANCH}&event=push&per_page=1"
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

    def commit(self, path: str, data: bytes, sha: str | None, uploads: list, message: str) -> str:
        with self.lock:
            if self.read(path)[1] != sha:
                raise Conflict(CHANGED)
            for upload_path, served_at, _ in uploads:
                if (self.root / upload_path).exists():
                    raise Conflict(exists(served_at))
            for file_path, file_data in [*[(p, d) for p, _, d in uploads], (path, data)]:
                file = self.root / file_path
                file.parent.mkdir(parents=True, exist_ok=True)
                temporary = file.with_suffix(file.suffix + ".tmp")
                temporary.write_bytes(file_data)
                temporary.replace(file)
            print(f"committed {path} and {len(uploads)} file(s): {message}", flush=True)
            return hashlib.sha1(data).hexdigest()

    def latest_build(self) -> dict | None:
        return None


CHANGED = "The content changed somewhere else in the meantime. Reload the page and try again."


def exists(served_at: str) -> str:
    return f"{served_at} already exists. Rename the file and add it again."


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
        clean["link"] = {"href": href, "label": text(link, "label", required=False) or href}
    if kind == "software":
        clean["summary"] = text(entry, "summary", limit=1000)
    clean["body"] = text(entry, "body", required=False, limit=200_000)
    return clean


def clean_post(entry: dict) -> dict:
    clean = {
        "slug": text(entry, "slug", limit=80),
        "title": text(entry, "title"),
        "date": text(entry, "date", limit=10),
        "summary": text(entry, "summary", required=False, limit=1000),
        "body": text(entry, "body", limit=200_000),
    }
    if not DATE.match(clean["date"]):
        raise Invalid(f"The date of “{clean['title']}” must look like 2026-11-10.")
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


def upload_name(filename: str) -> tuple[str, str]:
    stem, _, extension = filename.rpartition(".")
    extension = extension.lower()
    if extension not in UPLOAD_DIRS:
        raise Invalid("Only PDF, PNG, JPEG and WebP files can be uploaded.")
    # Stripped again after cutting, so naming an already cleaned name again
    # gives the same name; the panel cleans names the same way.
    slug = re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-")[:80].strip("-")
    if not slug:
        raise Invalid("The file needs a name.")
    repo_dir, url_dir = UPLOAD_DIRS[extension]
    name = f"{slug}.{extension}"
    return f"{repo_dir}/{name}", f"{url_dir}/{name}"


def clean_uploads(files) -> list[tuple[str, str, bytes]]:
    if not files:
        return []
    if not isinstance(files, list) or len(files) > MAX_FILES:
        raise Invalid(f"A save can bring at most {MAX_FILES} files.")
    uploads, seen = [], set()
    for file in files:
        if not isinstance(file, dict) or not isinstance(file.get("name"), str):
            raise Invalid("Every file needs a name.")
        path, served_at = upload_name(file["name"])
        if path.rsplit("/", 1)[1] != file["name"] or path in seen:
            raise Invalid(f"The file name {file['name']} is not usable; rename the file and add it again.")
        seen.add(path)
        try:
            data = base64.b64decode(file.get("data") or "", validate=True)
        except ValueError as error:
            raise Invalid(f"{file['name']} did not arrive intact. Add it again.") from error
        if not data or len(data) > MAX_FILE:
            raise Invalid(f"{file['name']} must be smaller than {MAX_FILE // (1024 * 1024)} MB.")
        uploads.append((path, served_at, data))
    return uploads


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


# HTTP


class AdminHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        route = urllib.parse.urlsplit(self.path).path.rstrip("/")
        if route == "/api/admin/content":
            try:
                content = {name: read_collection(path) for name, path in COLLECTIONS.items()}
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
        body = self._read_body(MAX_REQUEST)
        if body is None:
            return None
        try:
            payload = json.loads(body)
            items = clean_collection(name, payload.get("items"))
            uploads = clean_uploads(payload.get("files"))
        except (ValueError, AttributeError):
            return self._respond(400, {"error": "The request is not valid JSON."})
        except Invalid as error:
            return self._respond(422, {"error": str(error)})
        message = str(payload.get("message") or f"Update {name} from the admin panel")[:200]
        data = (json.dumps(items, indent=2, ensure_ascii=False) + "\n").encode()
        if len(data) > MAX_CONTENT:
            return self._respond(413, {"error": "The content is too long to save in one file."})
        try:
            sha = store.commit(COLLECTIONS[name], data, payload.get("sha"), uploads, message)
        except Conflict as error:
            return self._respond(409, {"error": str(error)})
        return self._respond(200, {"sha": sha, "items": items})

    def _read_body(self, limit: int) -> bytes | None:
        # The login cookie is SameSite=Lax, which already keeps it off
        # cross-site writes; this is a second lock that holds even if that
        # cookie setting ever changes.
        if self.headers.get("Origin") != ALLOWED_ORIGIN:
            self._respond(403, {"error": "Writes are only accepted from the admin page."})
            return None
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > limit:
            self._respond(413, {"error": "The save is too large. Leave out some files and try again."})
            return None
        return self.rfile.read(length)

    def handle_one_request(self):
        try:
            super().handle_one_request()
        except urllib.error.URLError as error:
            print(f"GitHub request failed: {error}", flush=True)
            self._respond(502, {"error": "GitHub could not be reached or refused the request. Try again shortly."})
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
