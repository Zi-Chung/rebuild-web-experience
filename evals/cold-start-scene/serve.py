#!/usr/bin/env python3
"""Loopback-only reference/output server. Never serves the fixture directory."""
import argparse
import mimetypes
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--port', type=int, default=9381)
parser.add_argument('--output', type=Path, default=ROOT / 'reconstruction')
args = parser.parse_args()
REFERENCE = (ROOT / 'reference').resolve()
OUTPUT = args.output.resolve()
if OUTPUT == ROOT or OUTPUT in ROOT.parents or OUTPUT == REFERENCE:
    parser.error('--output must designate a separate reconstruction directory')
REFERENCE_FILES = {p.relative_to(REFERENCE).as_posix() for p in REFERENCE.rglob('*') if p.is_file() and p.suffix != '.map'}
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/javascript', '.mjs')
for suffix in ['.glsl', '.frag', '.vert']:
    mimetypes.add_type('text/plain', suffix)

class Handler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        route = unquote(urlsplit(self.path).path)
        if route == '/':
            self.send_response(302)
            self.send_header('Location', '/reference/')
            self.end_headers()
            return
        if route.startswith('/reference/'):
            base, relative = REFERENCE, route[len('/reference/'):]
            relative = relative or 'index.html'
            if relative not in REFERENCE_FILES:
                self.send_error(404)
                return
        elif route.startswith('/reconstruction/'):
            base, relative = OUTPUT, route[len('/reconstruction/'):]
            relative = relative or 'index.html'
            parts = Path(relative).parts
            if any(p.startswith('.') or p in {'tests', 'test', 'evidence', 'authoring', 'node_modules'} for p in parts) or relative.endswith(('.map', '.test.js', '.test.mjs', '.spec.js', '.spec.mjs', '.md', '.py')):
                self.send_error(404)
                return
        else:
            self.send_error(404)
            return
        file = (base / relative).resolve()
        if base not in file.parents or not file.is_file():
            self.send_error(404)
            return
        payload = file.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', mimetypes.guess_type(file.name)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(payload)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(payload)

    def log_message(self, format, *values):
        pass

server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
print(f'http://127.0.0.1:{server.server_port}/reference/', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
