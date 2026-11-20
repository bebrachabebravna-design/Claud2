"""Защита: L0 — свободно, L1 — только с подтверждением. Kill switch и dry-run."""
import json
import time
from . import config

KILL = config.DATA / "KILL"           # файл существует -> L1 запрещены
AUDIT = config.DATA / "audit.jsonl"
state = {"dry_run": False}
_confirm = None  # функция (текст) -> bool, задаётся интерфейсом


def set_confirm(fn):
    global _confirm
    _confirm = fn


def kill(on: bool):
    KILL.touch() if on else KILL.unlink(missing_ok=True)


def log(tool, args, result):
    with AUDIT.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"t": time.time(), "tool": tool, "args": args,
                            "res": str(result)[:300]}, ensure_ascii=False) + "\n")


def allow(tool: str, args: dict, level: int) -> tuple[bool, str]:
    if level == 0:
        return True, ""
    if KILL.exists():
        return False, "Kill switch включён: изменения запрещены."
    if state["dry_run"]:
        return False, f"Dry-run: я бы выполнила {tool} {args}, но ничего не меняю."
    if _confirm is None:
        return False, "Нет канала подтверждения — действие отклонено."
    ok = _confirm(f"{tool} {json.dumps(args, ensure_ascii=False)}")
    return (True, "") if ok else (False, "Пользователь отказал.")
