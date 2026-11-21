"""Локальный кэш ответов: одинаковый вопрос второй раз не тратит токены."""
import hashlib
import re
import sqlite3
import time
from . import config

TTL = int(config.os.environ.get("AQUA_CACHE_HOURS", "24")) * 3600
_db = sqlite3.connect(config.DATA / "cache.db", check_same_thread=False)
_db.execute("CREATE TABLE IF NOT EXISTS c(k TEXT PRIMARY KEY, ts REAL, ans TEXT)")
_db.commit()


def _key(q: str) -> str:
    q = re.sub(r"[^\w\s]", "", q.lower())
    return hashlib.sha256(" ".join(q.split()).encode()).hexdigest()


def cacheable(q: str) -> bool:
    # короткие реплики ("да", "ещё", "продолжай") зависят от контекста — не кэшируем
    return len(q.split()) >= 4 and not q.startswith("/")


def get(q: str):
    r = _db.execute("SELECT ts, ans FROM c WHERE k=?", (_key(q),)).fetchone()
    return r[1] if r and time.time() - r[0] < TTL else None


def put(q: str, ans: str):
    _db.execute("REPLACE INTO c VALUES(?,?,?)", (_key(q), time.time(), ans))
    _db.commit()


def clear():
    _db.execute("DELETE FROM c")
    _db.commit()
