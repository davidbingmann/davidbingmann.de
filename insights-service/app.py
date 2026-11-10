"""Page-view counter behind the admin panel's statistics.

Each view adds one to a counter for that page and day, and nothing else is
recorded: no IP address, no User-Agent, nothing that tells visitors apart.
This is the plain counting the German supervisory authorities describe in
their guidance for digital services (OH Digitale Dienste, para. 88); counting
unique visitors would need more than that. Besides the per-day counts there is
one per hour, kept for two days, so the panel can show the last 24 hours.
"""

import json
import os
import re
import sqlite3
import threading
from datetime import UTC, datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DB_PATH = os.environ.get("DB_PATH", "/data/insights.db")
PORT = int(os.environ.get("PORT", "5003"))

HIT_PATH = "/api/insights/hit"
# Caddy puts this path behind the Authelia login; this service never checks it.
STATS_PATH = "/api/admin/insights"
DAYS = 30
HOURS = 24

# Only the routes the site actually has, so nobody can fill the table with
# made-up paths.
COUNTED_PATH = re.compile(r"^/(impressum|(projects|posts)/[a-z0-9-]{1,80})?$")
BOT_UA = re.compile(r"bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python", re.IGNORECASE)

db = sqlite3.connect(DB_PATH, check_same_thread=False)
db.executescript(
    """
    CREATE TABLE IF NOT EXISTS views (
        day TEXT NOT NULL, path TEXT NOT NULL, count INTEGER NOT NULL,
        PRIMARY KEY (day, path)
    );
    CREATE TABLE IF NOT EXISTS hours (
        hour TEXT PRIMARY KEY, count INTEGER NOT NULL
    );
    DROP TABLE IF EXISTS visitors;
    """
)
lock = threading.Lock()


def hour_key(moment: datetime) -> str:
    return moment.strftime("%Y-%m-%dT%H")


def record_view(path: str):
    now = datetime.now(UTC)
    with lock:
        db.execute(
            "INSERT INTO views VALUES (?, ?, 1) ON CONFLICT DO UPDATE SET count = count + 1",
            (now.date().isoformat(), path),
        )
        db.execute(
            "INSERT INTO hours VALUES (?, 1) ON CONFLICT DO UPDATE SET count = count + 1",
            (hour_key(now),),
        )
        db.execute("DELETE FROM hours WHERE hour < ?", (hour_key(now - timedelta(hours=HOURS * 2)),))
        db.commit()


def stats() -> dict:
    """Daily counts for this period and the one before it, plus the last 24
    hours, all oldest first. Hours are UTC, as "YYYY-MM-DDTHH"."""
    now = datetime.now(UTC)
    end = now.date()
    start = end - timedelta(days=DAYS * 2 - 1)
    with lock:
        views = dict(
            db.execute(
                "SELECT day, SUM(count) FROM views WHERE day >= ? GROUP BY day",
                (start.isoformat(),),
            ).fetchall()
        )
        paths = db.execute(
            "SELECT path, SUM(count) AS n FROM views WHERE day > ? GROUP BY path ORDER BY n DESC",
            ((end - timedelta(days=DAYS)).isoformat(),),
        ).fetchall()
        hours = dict(db.execute("SELECT hour, count FROM hours").fetchall())

    days = []
    for offset in range(DAYS * 2):
        day = (start + timedelta(days=offset)).isoformat()
        days.append({"day": day, "views": views.get(day, 0)})
    last_hours = []
    for offset in range(HOURS - 1, -1, -1):
        key = hour_key(now - timedelta(hours=offset))
        last_hours.append({"hour": key, "views": hours.get(key, 0)})
    return {"days": days, "hours": last_hours, "paths": [{"path": p, "views": n} for p, n in paths]}


class InsightsHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path.rstrip("/") != HIT_PATH:
            return self._respond(404, {"ok": False})

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > 256:
            return self._respond(413, {"ok": False})
        path = self.rfile.read(length).decode(errors="replace").strip()

        # Headers are only looked at to skip bots and opted-out browsers.
        is_bot = BOT_UA.search(self.headers.get("User-Agent") or "")
        opted_out = self.headers.get("DNT") == "1" or self.headers.get("Sec-GPC") == "1"
        if COUNTED_PATH.match(path) and not is_bot and not opted_out:
            record_view(path)
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
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # no access log: nothing about the visitor is kept


if __name__ == "__main__":
    print(f"insights service listening on :{PORT}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", PORT), InsightsHandler).serve_forever()
