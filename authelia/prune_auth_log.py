"""Deletes Authelia's records of IP addresses once they are older than 30 days.

Authelia keeps every sign-in attempt, every one-time code it sends while a
passkey or authenticator app is registered, and every IP ban, each with an IP
address, and has no setting to expire them. The lockout only looks back ten
minutes and the codes expire after five, so a month is plenty for spotting
password guessing; the privacy text promises this limit.
"""

import os
import sqlite3
import time

DB_PATH = os.environ.get("DB_PATH", "/data/db.sqlite3")
KEEP_DAYS = int(os.environ.get("KEEP_DAYS", "30"))

# Every table of Authelia 4.39 with an IP column, and the column that dates a
# row. Check this list against the schema before moving to a new version.
TABLES = {
    "authentication_logs": "time",
    "one_time_code": "issued",
    "identity_verification": "iat",
    "banned_ip": "time",
}


def prune() -> dict[str, int]:
    deleted = {}
    with sqlite3.connect(DB_PATH, timeout=30) as db:
        for table, column in TABLES.items():
            # Authelia stores times as "YYYY-MM-DD HH:MM:SS.ffffff+00:00"
            # (UTC), which sorts correctly against SQLite's own UTC timestamps.
            cursor = db.execute(
                f"DELETE FROM {table} WHERE {column} < datetime('now', ?)",
                (f"-{KEEP_DAYS} days",),
            )
            deleted[table] = cursor.rowcount
    return deleted


if __name__ == "__main__":
    while True:
        try:
            print(f"deleted rows older than {KEEP_DAYS} days: {prune()}", flush=True)
        except sqlite3.Error as error:
            # Authelia creates the tables on its first start; try again later.
            print(f"could not prune: {error}", flush=True)
        time.sleep(24 * 60 * 60)
