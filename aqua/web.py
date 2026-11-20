"""Локальная веб-панель: http://127.0.0.1:PORT (интерфейс временный, потом перерисуем)."""
import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from . import agent, config, guard, voice

PAGE = (Path(__file__).parent / "index.html").read_text(encoding="utf-8")
pending = {}  # id -> {"desc", "ev", "ok"}


def web_confirm(desc):
    pid = str(time.time())
    pending[pid] = {"desc": desc, "ev": threading.Event(), "ok": False}
    pending[pid]["ev"].wait(120)
    return pending.pop(pid, {}).get("ok", False)


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        if self.path == "/api/pending":
            return self._json([{"id": k, "desc": v["desc"]} for k, v in pending.items()])
        if self.path == "/api/state":
            return self._json({"name": config.NAME, "dry": guard.state["dry_run"],
                               "kill": guard.KILL.exists()})
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(PAGE.replace("{{NAME}}", config.NAME).encode())

    def do_POST(self):
        d = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        if self.path == "/api/chat":
            guard.set_confirm(web_confirm)
            try:
                ans = agent.ask(d["text"])
            except Exception as e:  # noqa: BLE001
                ans = f"Ошибка: {e}"
            if d.get("speak"):
                voice.speak(ans)
            return self._json({"answer": ans})
        if self.path == "/api/confirm":
            p = pending.get(d["id"])
            if p:
                p["ok"] = bool(d["ok"])
                p["ev"].set()
            return self._json({})
        if self.path == "/api/dry":
            guard.state["dry_run"] = bool(d["on"])
        if self.path == "/api/kill":
            guard.kill(bool(d["on"]))
        self._json({})


def run():
    srv = ThreadingHTTPServer(("127.0.0.1", config.PORT), H)
    print(f"{config.NAME}: http://127.0.0.1:{config.PORT}")
    srv.serve_forever()
