"""Мозг: облачная модель + цикл вызова инструментов (Gemini или Claude)."""
import requests
from . import config, guard
from .tools import TOOLS

MAX_STEPS = 6
history: list[dict] = []   # [{"role": "user"|"assistant", "text": str}]


def _exec(name, args):
    t = TOOLS.get(name)
    if not t:
        return f"нет инструмента {name}"
    ok, why = guard.allow(name, args, t["level"])
    if not ok:
        res = why
    else:
        try:
            res = t["fn"](**args)
        except Exception as e:  # noqa: BLE001
            res = f"ошибка: {e}"
    guard.log(name, args, res)
    return res if isinstance(res, str) else str(res)


def _schema(t):
    return t["schema"] if t["schema"]["properties"] else None


# ---------- Gemini ----------
def _gemini(user_text):
    url = (f"https://generativelanguage.googleapis.com/v1beta/models/"
           f"{config.GEMINI_MODEL}:generateContent")
    decl = []
    for n, t in TOOLS.items():
        d = {"name": n, "description": t["desc"]}
        if _schema(t):
            d["parameters"] = t["schema"]
        decl.append(d)
    contents = [{"role": "user" if m["role"] == "user" else "model",
                 "parts": [{"text": m["text"]}]} for m in history[-20:]]
    contents.append({"role": "user", "parts": [{"text": user_text}]})
    for _ in range(MAX_STEPS):
        r = requests.post(url, params={"key": config.GEMINI_KEY}, timeout=60, json={
            "systemInstruction": {"parts": [{"text": config.PERSONA}]},
            "contents": contents, "tools": [{"functionDeclarations": decl}]})
        r.raise_for_status()
        parts = r.json()["candidates"][0]["content"].get("parts", [])
        calls = [p["functionCall"] for p in parts if "functionCall" in p]
        if not calls:
            return "".join(p.get("text", "") for p in parts).strip()
        contents.append({"role": "model", "parts": parts})
        contents.append({"role": "user", "parts": [
            {"functionResponse": {"name": c["name"],
                                  "response": {"result": _exec(c["name"], c.get("args", {}))}}}
            for c in calls]})
    return "Слишком много шагов, остановилась."


# ---------- Claude ----------
def _claude(user_text):
    tools = [{"name": n, "description": t["desc"], "input_schema": t["schema"]}
             for n, t in TOOLS.items()]
    msgs = [{"role": m["role"], "content": m["text"]} for m in history[-20:]]
    msgs.append({"role": "user", "content": user_text})
    for _ in range(MAX_STEPS):
        r = requests.post("https://api.anthropic.com/v1/messages", timeout=60, headers={
            "x-api-key": config.ANTHROPIC_KEY, "anthropic-version": "2023-06-01"},
            json={"model": config.ANTHROPIC_MODEL, "max_tokens": 1024,
                  "system": config.PERSONA, "tools": tools, "messages": msgs})
        r.raise_for_status()
        blocks = r.json()["content"]
        uses = [b for b in blocks if b["type"] == "tool_use"]
        if not uses:
            return "".join(b.get("text", "") for b in blocks).strip()
        msgs.append({"role": "assistant", "content": blocks})
        msgs.append({"role": "user", "content": [
            {"type": "tool_result", "tool_use_id": b["id"],
             "content": _exec(b["name"], b["input"])} for b in uses]})
    return "Слишком много шагов, остановилась."


def ask(text: str) -> str:
    if config.PROVIDER == "anthropic":
        if not config.ANTHROPIC_KEY:
            return "Нет ANTHROPIC_API_KEY в .env"
        answer = _claude(text)
    else:
        if not config.GEMINI_KEY:
            return "Нет GEMINI_API_KEY в .env"
        answer = _gemini(text)
    history.append({"role": "user", "text": text})
    history.append({"role": "assistant", "text": answer or "…"})
    del history[:-40]
    return answer
