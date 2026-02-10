# /// script
# dependencies = []
# ///
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import smtplib
import sys
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from email.message import EmailMessage

DEFAULT_LOG_GLOB = os.environ.get("CADDY_ACCESS_LOG_GLOB", "caddy_logs/access.jsonl*")


@dataclass(frozen=True)
class Report:
    target_date: date
    unique_visitors: int
    pageviews: int


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Count daily visitors from Caddy JSON access logs, and optionally email a report."
        )
    )
    parser.add_argument(
        "--date",
        default="yesterday",
        help='Target date in YYYY-MM-DD, or "yesterday" (default).',
    )
    parser.add_argument(
        "--log-glob",
        default=DEFAULT_LOG_GLOB,
        help=f"Glob for Caddy access logs (default: {DEFAULT_LOG_GLOB!r}).",
    )
    parser.add_argument(
        "--site-host",
        default=os.environ.get("SITE_HOST", "davidbingmann.de"),
        help='Only count requests whose Host equals this (default: "davidbingmann.de").',
    )
    parser.add_argument(
        "--send-email",
        action="store_true",
        help="Send the report via SMTP using env vars (SMTP_*).",
    )
    return parser.parse_args()


def resolve_target_date(value: str) -> date:
    if value == "yesterday":
        return (datetime.now().astimezone() - timedelta(days=1)).date()
    return date.fromisoformat(value)


_ASSET_EXT_RE = re.compile(
    r"\.(?:css|js|mjs|map|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|eot|txt|xml|json)$",
    flags=re.IGNORECASE,
)


def is_pageview(uri: str) -> bool:
    path = uri.split("?", 1)[0]

    # Skip obvious static assets and well-known endpoints.
    if path.startswith("/assets/"):
        return False
    if path in {"/favicon.ico", "/robots.txt", "/sitemap.xml"}:
        return False

    if _ASSET_EXT_RE.search(path):
        return False

    # If the last path segment contains a dot, treat it as a file request.
    last_segment = path.rsplit("/", 1)[-1]
    if "." in last_segment:
        return False

    return True


def iter_log_paths(log_glob: str) -> list[str]:
    paths = sorted(glob.glob(log_glob))
    return [path for path in paths if os.path.isfile(path)]


def compute_report(
    *,
    target_date: date,
    log_paths: list[str],
    site_host: str,
) -> Report:
    start = datetime.combine(target_date, datetime.min.time()).astimezone()
    end = start + timedelta(days=1)

    unique_ips: set[str] = set()
    pageviews = 0

    for path in log_paths:
        with open(path, "r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue

                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    continue

                if event.get("logger", "").startswith("http.log.access") is False:
                    continue

                ts = event.get("ts")
                if not isinstance(ts, (int, float)):
                    continue

                when = datetime.fromtimestamp(ts, tz=UTC).astimezone()
                if when < start or when >= end:
                    continue

                request = event.get("request")
                if not isinstance(request, dict):
                    continue

                if request.get("host") != site_host:
                    continue
                if request.get("method") != "GET":
                    continue

                status = event.get("status")
                if not isinstance(status, int) or status < 200 or status >= 400:
                    continue

                uri = request.get("uri")
                if not isinstance(uri, str) or not is_pageview(uri):
                    continue

                ip = request.get("remote_ip") or request.get("client_ip")
                if not isinstance(ip, str) or not ip:
                    continue

                unique_ips.add(ip)
                pageviews += 1

    return Report(target_date=target_date, unique_visitors=len(unique_ips), pageviews=pageviews)


def format_report_text(report: Report) -> str:
    return "\n".join(
        [
            f"Daily visitors report for {report.target_date.isoformat()}",
            "",
            f"Unique visitors (by IP): {report.unique_visitors}",
            f"Pageviews (HTML-ish GETs): {report.pageviews}",
        ]
    )


def send_email(*, subject: str, body: str) -> None:
    host = os.environ.get("SMTP_HOST")
    port = int(os.environ.get("SMTP_PORT", "587"))
    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")
    to_addr = os.environ.get("SMTP_TO")
    from_addr = os.environ.get("SMTP_FROM") or user

    missing = [name for name, value in [("SMTP_HOST", host), ("SMTP_TO", to_addr)] if not value]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = from_addr or "no-reply@localhost"
    message["To"] = to_addr
    message.set_content(body)

    with smtplib.SMTP(host, port, timeout=30) as smtp:
        smtp.ehlo()
        if os.environ.get("SMTP_STARTTLS", "1") != "0":
            smtp.starttls()
            smtp.ehlo()
        if user and password:
            smtp.login(user, password)
        smtp.send_message(message)


def main() -> int:
    args = parse_args()
    target_date = resolve_target_date(args.date)

    log_paths = iter_log_paths(args.log_glob)
    if not log_paths:
        print(
            f"No access logs found (glob: {args.log_glob!r}). "
            "Enable Caddy access logging first.",
            file=sys.stderr,
        )
        return 2

    report = compute_report(target_date=target_date, log_paths=log_paths, site_host=args.site_host)
    body = format_report_text(report)

    subject = f"{args.site_host} visitors: {report.unique_visitors} ({report.target_date.isoformat()})"

    if args.send_email:
        send_email(subject=subject, body=body)
    else:
        print(subject)
        print(body)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

