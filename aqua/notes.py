"""Заметки в SQLite с полнотекстовым поиском."""
import sqlite3
import time
from . import config

_db = sqlite3.connect(config.DATA / "notes.db", check_same_thread=False)
_db.execute("CREATE TABLE IF NOT EXISTS notes(id INTEGER PRIMARY KEY, ts REAL, text TEXT)")
_db.execute("CREATE VIRTUAL TABLE IF NOT EXISTS fts USING fts5(text, content='notes', content_rowid='id')")
_db.commit()


def add(text: str) -> int:
    cur = _db.execute("INSERT INTO notes(ts,text) VALUES(?,?)", (time.time(), text))
    _db.execute("INSERT INTO fts(rowid,text) VALUES(?,?)", (cur.lastrowid, text))
    _db.commit()
    return cur.lastrowid


def search(q: str, limit=10):
    q = '"' + q.replace('"', " ") + '"'
    rows = _db.execute("SELECT n.id,n.text FROM fts JOIN notes n ON n.id=fts.rowid "
                       "WHERE fts MATCH ? LIMIT ?", (q, limit)).fetchall()
    return [{"id": i, "text": t} for i, t in rows]


def recent(limit=10):
    rows = _db.execute("SELECT id,text FROM notes ORDER BY id DESC LIMIT ?", (limit,)).fetchall()
    return [{"id": i, "text": t} for i, t in rows]


def delete(nid: int):
    _db.execute("DELETE FROM notes WHERE id=?", (nid,))
    _db.execute("INSERT INTO fts(fts,rowid,text) VALUES('delete',?,'')", (nid,))
    _db.commit()
