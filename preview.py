"""Run the Verlyn review site and accept test enquiries on localhost."""

import json
import re
import sys
from collections import deque
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from uuid import uuid4

ROOT = Path(__file__).resolve().parent
FIELDS = {"name": 120, "email": 254, "company": 160, "leads": 400}


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def list_directory(self, path):
        self.send_error(404)
        return None

    def end_headers(self):
        if self.command in {"GET", "HEAD"}:
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        candidate = Path(self.translate_path(self.path)).resolve()
        if not candidate.is_relative_to(ROOT):
            self.send_error(404)
            return None
        relative = candidate.relative_to(ROOT)
        if relative.parts and relative.parts[0] != "assets" and (
            len(relative.parts) != 1 or candidate.suffix not in {".html", ".css", ".js", ".png", ".txt", ".xml"}
        ):
            self.send_error(404)
            return None
        return super().send_head()

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if urlsplit(self.path).path != "/api/enquiries":
            self.send_json(404, {"error": "Unknown endpoint"})
            return
        if self.headers.get("Origin") not in {None, f"http://127.0.0.1:{self.server.server_port}", f"http://localhost:{self.server.server_port}"}:
            self.send_json(403, {"error": "Unexpected origin"})
            return
        if self.headers.get_content_type() != "application/x-www-form-urlencoded":
            self.send_json(415, {"error": "Unsupported request format"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 16384:
                raise ValueError
            submitted = parse_qs(self.rfile.read(length).decode("utf-8"), max_num_fields=12)
            fields = {key: submitted.get(key, [""])[0].strip() for key in FIELDS}
            if any(not fields[key] or len(fields[key]) > limit for key, limit in FIELDS.items()):
                raise ValueError
            if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", fields["email"]):
                raise ValueError
        except (ValueError, UnicodeError):
            self.send_json(400, {"error": "Complete the required fields with valid values"})
            return

        reference = uuid4().hex[:12].upper()
        entry = {"reference": reference, "time": datetime.now(timezone.utc).isoformat(), **fields}
        self.server.receipts.append(entry)
        self.send_json(201, {"reference": reference, "preview": True})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    with ThreadingHTTPServer(("127.0.0.1", port), PreviewHandler) as server:
        # Keep recent test submissions in memory for the lifecycle of the preview.
        server.receipts = deque(maxlen=100)
        print(f"Local preview: http://127.0.0.1:{port}/", flush=True)
        server.serve_forever()
