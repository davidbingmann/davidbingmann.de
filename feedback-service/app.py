"""Semestral feedback endpoint: receives JSON POSTs and forwards them by mail."""

import json
import os
import smtplib
import threading
import time
from email.message import EmailMessage
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SMTP_HOST = "smtp.mail.me.com"
SMTP_PORT = 587
SMTP_USER = os.environ["SMTP_USER"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]
MAIL_FROM = os.environ.get("MAIL_FROM", SMTP_USER)
MAIL_TO = os.environ.get("MAIL_TO", "semestral@davidbingmann.de")

MAX_BODY = 16 * 1024
RATE_LIMIT_SECONDS = 10

_last_request: dict[str, float] = {}  # ip -> timestamp
_rate_lock = threading.Lock()


def reserve_slot(ip: str, now: float) -> bool:
    """Claims this IP's slot before the mail goes out, so parallel requests
    cannot all pass the check while the first one is still sending."""
    with _rate_lock:
        for stale in [key for key, at in _last_request.items() if now - at >= RATE_LIMIT_SECONDS]:
            del _last_request[stale]
        if ip in _last_request:
            return False
        _last_request[ip] = now
        return True


def release_slot(ip: str, now: float):
    with _rate_lock:
        if _last_request.get(ip) == now:
            del _last_request[ip]


class FeedbackHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Caddy proxies the full path; tolerate a stripped prefix too.
        if self.path.rstrip("/") not in ("/api/semestral/feedback", ""):
            return self._respond(404, ok=False)

        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0 or length > MAX_BODY:
            return self._respond(413, ok=False)

        try:
            data = json.loads(self.rfile.read(length))
        except (ValueError, UnicodeDecodeError):
            return self._respond(400, ok=False)
        if not isinstance(data, dict):
            return self._respond(400, ok=False)

        message = str(data.get("message") or "").strip()
        if not message:
            return self._respond(400, ok=False)

        ip = (self.headers.get("X-Forwarded-For") or self.client_address[0]).split(",")[0].strip()
        now = time.time()
        if not reserve_slot(ip, now):
            return self._respond(429, ok=False)

        feedback_type = "Bug" if data.get("type") == "bug" else "Feature Request"
        try:
            send_mail(feedback_type, data, message)
        except Exception as exc:  # noqa: BLE001 - report any delivery failure as 502
            print(f"mail delivery failed: {exc}", flush=True)
            # A failed delivery should not stop the sender from trying again.
            release_slot(ip, now)
            return self._respond(502, ok=False)

        return self._respond(200, ok=True)

    def _respond(self, code: int, ok: bool):
        body = json.dumps({"ok": ok}).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # keep container logs free of per-request noise


def send_mail(feedback_type: str, data: dict, message: str):
    mail = EmailMessage()
    mail["Subject"] = f"[Semestral] {feedback_type}"
    mail["From"] = MAIL_FROM
    mail["To"] = MAIL_TO
    mail.set_content(
        f"{message}\n\n"
        "---\n"
        f"App: {data.get('appVersion')}\n"
        f"OS: {data.get('osVersion')}\n"
        f"Device: {data.get('deviceModel')}\n"
        f"Language: {data.get('appLanguage')}\n"
        f"Platform: {data.get('platform')}\n"
    )
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=20) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASSWORD)
        smtp.send_message(mail)


if __name__ == "__main__":
    print("feedback service listening on :5002", flush=True)
    ThreadingHTTPServer(("0.0.0.0", 5002), FeedbackHandler).serve_forever()
