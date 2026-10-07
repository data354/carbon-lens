""" Rate limiting middleware for the CarbonLens API. """
import math
import time

from limits import parse_many
from limits.storage import MemoryStorage
from limits.strategies import MovingWindowRateLimiter
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send

from core.config import RATE_LIMITS, ROUTER_PREFIXES

# Rate limit rules
RATE_LIMIT_RULES = [
    (f"{ROUTER_PREFIXES['tiles']}/stats/geometry", "geometry"),
    (f"{ROUTER_PREFIXES['files']}/download", "export"),
    (ROUTER_PREFIXES["tiles"], "tiles"),
    (ROUTER_PREFIXES["geo"], "geo"),
    (ROUTER_PREFIXES["catalog"], "catalog"),
]


class RateLimitMiddleware:
    """ Per client IP rate limiting on API endpoint groups. """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app
        self.limiter = MovingWindowRateLimiter(MemoryStorage())
        self.limits = {group: parse_many(value) for group, value in RATE_LIMITS.items()}

    @staticmethod
    def get_group(scope: Scope) -> str | None:
        """ Return the limit group of the request path, if any. """
        path = scope["path"]
        root_path = scope.get("root_path", "")
        if root_path and (path == root_path or path.startswith(root_path + "/")):
            path = path[len(root_path):]

        for prefix, group in RATE_LIMIT_RULES:
            if path == prefix or path.startswith(prefix + "/"):
                return group
        return None

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        group = self.get_group(scope) if scope["type"] == "http" else None

        if group in self.limits:
            client = scope.get("client")
            client_ip = client[0] if client else "unknown"
            for limit in self.limits[group]:
                if not self.limiter.hit(limit, group, client_ip):
                    reset_time, _ = self.limiter.get_window_stats(limit, group, client_ip)
                    response = JSONResponse(
                        status_code=429,
                        content={"detail": "Too many requests, please retry later."},
                        headers={"Retry-After": str(max(1, math.ceil(reset_time - time.time())))},
                    )
                    await response(scope, receive, send)
                    return

        await self.app(scope, receive, send)
