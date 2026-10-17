"""Cookie-free visitor counter for the site's Insights section.

A visitor is recognised only within one day, by a hash of the IP address and
User-Agent salted with a secret that lives in memory and is replaced at
midnight (UTC). Neither the IP, the User-Agent nor the hash is ever written to
disk; the database holds nothing but per-day counts.
"""

import hashlib
import json
import os
import re
import secrets
import sqlite3
import threading
from datetime import date, datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DB_PATH = os.environ.get("DB_PATH", "/data/insights.db")
PORT = int(os.environ.get("PORT", "5003"))

HIT_PATH = "/api/insights/hit"
STATS_PATH = "/api/insights"
DAYS = 30

# Only the routes the site actually has, so nobody can fill the table with
# made-up paths.
COUNTED_PATH = re.compile(r"^/(impressum|insights|projects/[a-z0-9-]{1,80})?$")
BOT_UA = re.compile(r"bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python", re.I)

db = sqlite3.connect(DB_PATH, check_same_thread=False)
db.executescript(
    """
    CREATE TABLE IF NOT EXISTS views (
        day TEXT NOT NULL, path TEXT NOT NULL, count INTEGER NOT NULL,
        PRIMARY KEY (day, path)
    );
    CREATE TABLE IF NOT EXISTS visitors (
        day TEXT PRIMARY KEY, count INTEGER NOT NULL
    );
    """
)
lock = threading.Lock()

# Today's salt and the visitor hashes seen today. Memory only, by design: a
# restart forgets them, at the cost of counting someone twice on that day.
salt_day: str | None = None
salt = b""
seen: set[str] = set()


def today() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def record_hit(path: str, ip: str, user_agent: str):
    global salt_day, salt, seen
    day = today()
    with lock:
        if salt_day != day:
            salt_day, salt, seen = day, secrets.token_bytes(32), set()
        visitor = hashlib.sha256(salt + f"{ip}\n{user_agent}".encode()).hexdigest()
        db.execute(
            "INSERT INTO views VALUES (?, ?, 1) ON CONFLICT DO UPDATE SET count = count + 1",
            (day, path),
        )
        if visitor not in seen:
            seen.add(visitor)
            db.execute(
                "INSERT INTO visitors VALUES (?, 1) ON CONFLICT DO UPDATE SET count = count + 1",
                (day,),
            )
        db.commit()


def stats() -> dict:
    """Daily counts for this period and the one before it, oldest first."""
    end = date.fromisoformat(today())
    start = end - timedelta(days=DAYS * 2 - 1)
    with lock:
        views = dict(
            db.execute(
                "SELECT day, SUM(count) FROM views WHERE day >= ? GROUP BY day",
                (start.isoformat(),),
            ).fetchall()
        )
        visitors = dict(
            db.execute("SELECT day, count FROM visitors WHERE day >= ?", (start.isoformat(),)).fetchall()
        )
        paths = db.execute(
            "SELECT path, SUM(count) AS n FROM views WHERE day > ? GROUP BY path ORDER BY n DESC",
            ((end - timedelta(days=DAYS)).isoformat(),),
        ).fetchall()

    days = []
    for offset in range(DAYS * 2):
        day = (start + timedelta(days=offset)).isoformat()
        days.append({"day": day, "visitors": visitors.get(day, 0), "views": views.get(day, 0)})
    return {"days": days, "paths": [{"path": p, "views": n} for p, n in paths]}


class InsightsHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path.rstrip("/") != HIT_PATH:
            return self._respond(404, {"ok": False})

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 256:
            return self._respond(413, {"ok": False})
        path = self.rfile.read(length).decode(errors="replace").strip()

        user_agent = self.headers.get("User-Agent") or ""
        opted_out = self.headers.get("DNT") == "1" or self.headers.get("Sec-GPC") == "1"
        if COUNTED_PATH.match(path) and not BOT_UA.search(user_agent) and not opted_out:
            ip = (self.headers.get("X-Forwarded-For") or self.client_address[0]).split(",")[0].strip()
            record_hit(path, ip, user_agent)
        # The beacon never reads the answer; say the same thing either way.
        return self._respond(204, None)

    def do_GET(self):
        if self.path.rstrip("/") != STATS_PATH:
            return self._respond(404, {"ok": False})
        return self._respond(200, stats())

    def _respond(self, code: int, payload: dict | None):
        self.send_response(code)
        if payload is None:
            self.end_headers()
            return
        body = json.dumps(payload).encode()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "public, max-age=300")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # no access log: the point is to keep IPs off disk


if __name__ == "__main__":
    print(f"insights service listening on :{PORT}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), InsightsHandler).serve_forever()
