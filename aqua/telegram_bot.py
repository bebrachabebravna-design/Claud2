"""Telegram через long polling. Отвечает только владельцу."""
import threading
import time
import requests
from . import agent, config, guard

API = f"https://api.telegram.org/bot{config.TG_TOKEN}"
_pending: dict = {}   # id -> {"ev": Event, "ok": bool}


def _send(chat, text, markup=None):
    d = {"chat_id": chat, "text": text[:4000]}
    if markup:
        d["reply_markup"] = markup
    requests.post(f"{API}/sendMessage", json=d, timeout=20)


def _confirm(chat):
    def fn(desc):
        pid = str(time.time())
        ev = threading.Event()
        _pending[pid] = {"ev": ev, "ok": False}
        _send(chat, f"Разрешить?\n{desc}", {"inline_keyboard": [[
            {"text": "✅ Да", "callback_data": f"y{pid}"},
            {"text": "❌ Нет", "callback_data": f"n{pid}"}]]})
        ev.wait(120)
        return _pending.pop(pid, {}).get("ok", False)
    return fn


def _handle(upd):
    if "callback_query" in upd:
        cq = upd["callback_query"]
        if str(cq["from"]["id"]) != config.TG_OWNER:
            return
        p = _pending.get(cq["data"][1:])
        if p:
            p["ok"] = cq["data"][0] == "y"
            p["ev"].set()
        return
    m = upd.get("message") or {}
    if str(m.get("from", {}).get("id")) != config.TG_OWNER or "text" not in m:
        return
    chat = m["chat"]["id"]
    guard.set_confirm(_confirm(chat))
    try:
        _send(chat, agent.ask(m["text"]) or "…")
    except Exception as e:  # noqa: BLE001
        _send(chat, f"Ошибка: {e}")


def run():
    off = 0
    while True:
        try:
            r = requests.get(f"{API}/getUpdates", params={"offset": off, "timeout": 30}, timeout=40)
            for u in r.json().get("result", []):
                off = u["update_id"] + 1
                threading.Thread(target=_handle, args=(u,), daemon=True).start()
        except Exception:  # noqa: BLE001
            time.sleep(5)
