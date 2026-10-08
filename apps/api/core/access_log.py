""" Access and data export logging middleware for the CarbonLens API. """
import json
import logging
import sys
import time
from datetime import datetime, timezone
from urllib.parse import parse_qsl

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from core.rate_limit import RateLimitMiddleware

# Endpoint groups whose requests are logged as data exports
EXPORT_GROUPS = {"export", "geometry"}
MAX_FIELD_LENGTH = 1024

# One JSON line per request on stdout, kept apart from application logs
access_logger = logging.getLogger("carbonlens.access")
access_logger.setLevel(logging.INFO)
access_logger.propagate = False
if not access_logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter("%(message)s"))
    access_logger.addHandler(handler)


class AccessLogMiddleware:
    """ Log every HTTP request, flagging data exports and rate limited requests. """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start = time.perf_counter()
        response = {"status": 500, "bytes_sent": 0, "complete": False}

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                response["status"] = message["status"]
            elif message["type"] == "http.response.body":
                response["bytes_sent"] += len(message.get("body", b""))
                response["complete"] = not message.get("more_body", False)
            await send(message)

        try:
            await self.app(scope, receive, send_wrapper)
        finally:
            self.log(scope, response, time.perf_counter() - start)

    @staticmethod
    def log(scope: Scope, response: dict, duration: float) -> None:
        """ Write the log entry of a finished request. """
        headers = {k.decode("latin-1"): v.decode("latin-1") for k, v in scope["headers"]}
        query = scope.get("query_string", b"").decode("latin-1")
        group = RateLimitMiddleware.get_group(scope)
        status = response["status"]
        content_length = headers.get("content-length", "")
        client = scope.get("client")
        # CORS preflight requests are not exports
        is_export = group in EXPORT_GROUPS and scope["method"] != "OPTIONS"

        if status == 429:
            event, level = "rate_limited", logging.WARNING
        elif is_export:
            event, level = "data_export", logging.INFO
        else:
            event, level = "access", logging.INFO
        if status >= 500:
            level = logging.ERROR

        entry = {
            "ts": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
            "level": logging.getLevelName(level),
            "event": event,
            "client_ip": client[0] if client else None,
            "method": scope["method"],
            "path": scope["path"],
            "query": query[:MAX_FIELD_LENGTH],
            "group": group,
            "status": status,
            "duration_ms": round(duration * 1000, 1),
            "bytes_sent": response["bytes_sent"],
            "complete": response["complete"],
            "request_bytes": int(content_length) if content_length.isdigit() else None,
            "user_agent": headers.get("user-agent", "")[:MAX_FIELD_LENGTH] or None,
            "referer": headers.get("referer", "")[:MAX_FIELD_LENGTH] or None,
        }
        if is_export:
            entry["params"] = dict(parse_qsl(query))

        access_logger.log(level, json.dumps(entry, ensure_ascii=False))
