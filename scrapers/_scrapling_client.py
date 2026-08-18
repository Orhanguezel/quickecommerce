#!/usr/bin/env python3
"""Small Scrapling client used by image-cache maintenance jobs.

Credentials are read only from the environment. Binary downloads first try a
normal HTTP request, then an optional dedicated binary endpoint, and finally
the documented async job API. The async decoder accepts a few backwards-
compatible base64 field names so the client does not need another release when
the scraper service gains binary responses.
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path
from typing import Any
from http.client import HTTPException
from urllib import request
from urllib.error import HTTPError, URLError
from urllib.parse import quote, unquote, urlsplit, urlunsplit


class ScraplingError(RuntimeError):
    pass


class BinaryDownloadUnsupported(ScraplingError):
    pass


class ScraplingClient:
    def __init__(self, base_url: str | None = None, api_key: str | None = None, timeout: int = 300):
        self.base_url = (base_url or os.environ.get("SCRAPER_URL", "")).rstrip("/")
        self.api_key = api_key or os.environ.get("SCRAPER_API_KEY", "")
        self.binary_endpoint = os.environ.get("SCRAPER_BINARY_ENDPOINT", "").strip()
        self.timeout = max(10, timeout)

    def _headers(self, content_type: str | None = None) -> dict[str, str]:
        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
            "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        if content_type:
            headers["Content-Type"] = content_type
        return headers

    def _open(self, req: request.Request, timeout: int | None = None) -> tuple[bytes, str]:
        try:
            with request.urlopen(req, timeout=timeout or self.timeout) as response:
                return response.read(), response.headers.get("Content-Type", "")
        except (HTTPError, URLError, TimeoutError, HTTPException) as exc:
            raise ScraplingError(str(exc)) from exc

    @staticmethod
    def _normalize_url(url: str) -> str:
        """Percent-encode Unicode/control characters without changing URL semantics."""
        parts = urlsplit(url.strip())
        path = quote(unquote(parts.path), safe="/:@!$&'()*+,;=-._~")
        query = quote(unquote(parts.query), safe="=&?/:;+,%@-._~")
        fragment = quote(unquote(parts.fragment), safe="=&?/:;+,%@-._~")
        return urlunsplit((parts.scheme, parts.netloc, path, query, fragment))

    def _json(self, url: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        body = json.dumps(payload).encode("utf-8") if payload is not None else None
        req = request.Request(
            url,
            data=body,
            headers=self._headers("application/json" if body is not None else None),
            method="POST" if body is not None else "GET",
        )
        raw, _ = self._open(req, min(self.timeout, 60))
        try:
            value = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ScraplingError("Scraper service returned invalid JSON") from exc
        if not isinstance(value, dict):
            raise ScraplingError("Scraper service returned a non-object response")
        return value

    @staticmethod
    def _decode_binary(value: Any) -> tuple[bytes, str] | None:
        if not isinstance(value, dict):
            return None
        candidates = [
            value,
            value.get("data"),
            value.get("result"),
            (value.get("result") or {}).get("data") if isinstance(value.get("result"), dict) else None,
        ]
        for candidate in candidates:
            if not isinstance(candidate, dict):
                continue
            content_type = str(candidate.get("content_type") or candidate.get("mime_type") or "")
            for key in ("body_base64", "binary_base64", "content_base64", "base64"):
                encoded = candidate.get(key)
                if isinstance(encoded, str) and encoded:
                    try:
                        return base64.b64decode(encoded, validate=True), content_type
                    except ValueError:
                        continue
        return None

    def _direct_download(self, url: str) -> tuple[bytes, str]:
        req = request.Request(self._normalize_url(url), headers=self._headers(), method="GET")
        raw, content_type = self._open(req, min(self.timeout, 60))
        if not content_type.lower().startswith("image/"):
            raise ScraplingError(f"Direct response is not an image ({content_type or 'unknown'})")
        return raw, content_type

    def _binary_endpoint_download(self, url: str) -> tuple[bytes, str]:
        if not self.binary_endpoint:
            raise BinaryDownloadUnsupported("SCRAPER_BINARY_ENDPOINT is not configured")
        req = request.Request(
            self.binary_endpoint,
            data=json.dumps({"url": url, "mode": "stealthy", "solve_cloudflare": True}).encode("utf-8"),
            headers=self._headers("application/json"),
            method="POST",
        )
        raw, content_type = self._open(req)
        if content_type.lower().startswith("image/"):
            return raw, content_type
        try:
            decoded = self._decode_binary(json.loads(raw.decode("utf-8")))
        except (UnicodeDecodeError, json.JSONDecodeError):
            decoded = None
        if decoded:
            return decoded
        raise BinaryDownloadUnsupported("Configured binary endpoint did not return image bytes")

    def _async_job_download(self, url: str) -> tuple[bytes, str]:
        if not self.base_url or not self.api_key:
            raise BinaryDownloadUnsupported("SCRAPER_URL/SCRAPER_API_KEY are not configured")
        created = self._json(
            f"{self.base_url}/api/v1/jobs",
            {
                "type": "scrape",
                "payload": {
                    "url": url,
                    "mode": "stealthy",
                    "options": {
                        "headless": True,
                        "network_idle": False,
                        "timeout": min(self.timeout, 120),
                        "solve_cloudflare": True,
                    },
                    "return_binary": True,
                    "return_html": False,
                },
            },
        )
        job_id = str(created.get("job_id") or "")
        if not job_id:
            raise ScraplingError(f"Async job was not created: {created.get('detail') or 'missing job_id'}")

        deadline = time.monotonic() + self.timeout
        while time.monotonic() < deadline:
            status = self._json(f"{self.base_url}/api/v1/jobs/{job_id}")
            state = str(status.get("status") or "")
            if state in {"completed", "done"}:
                decoded = self._decode_binary(status)
                if decoded:
                    return decoded
                raise BinaryDownloadUnsupported(
                    "Scraper async API completed without lossless binary/base64 data; deploy a binary endpoint or base64 result support"
                )
            if state in {"failed", "cancelled"}:
                raise ScraplingError(str(status.get("error") or f"Async job {state}"))
            time.sleep(5)
        raise ScraplingError(f"Async job timed out after {self.timeout}s")

    def download_binary(self, url: str) -> tuple[bytes, str, str]:
        errors: list[str] = []
        for source, callback in (
            ("direct", self._direct_download),
            ("binary_endpoint", self._binary_endpoint_download),
            ("async_job", self._async_job_download),
        ):
            try:
                body, content_type = callback(url)
                if not body:
                    raise ScraplingError("Empty response body")
                return body, content_type, source
            except ScraplingError as exc:
                errors.append(f"{source}: {exc}")
        raise ScraplingError("; ".join(errors))


def main() -> int:
    parser = argparse.ArgumentParser(description="Download one remote image through the safe scraper pipeline")
    parser.add_argument("url")
    parser.add_argument("--output", required=True)
    parser.add_argument("--timeout", type=int, default=300)
    args = parser.parse_args()

    try:
        body, content_type, source = ScraplingClient(timeout=args.timeout).download_binary(args.url)
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(body)
        print(json.dumps({"success": True, "content_type": content_type, "bytes": len(body), "source": source}))
        return 0
    except ScraplingError as exc:
        print(json.dumps({"success": False, "error": str(exc)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
