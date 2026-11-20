"""Инструменты управления Linux-ПК. level 0 — безопасно, 1 — нужно подтверждение."""
import os
import shlex
import shutil
import subprocess
from pathlib import Path
from . import notes

TOOLS = {}


def tool(name, desc, params, level=0):
    def deco(fn):
        TOOLS[name] = {"fn": fn, "level": level, "desc": desc,
                       "schema": {"type": "object", "properties": params,
                                  "required": list(params)}}
        return fn
    return deco


S = {"type": "string"}
I = {"type": "integer"}


def _sh(cmd, timeout=20):
    r = subprocess.run(cmd, shell=isinstance(cmd, str), capture_output=True,
                       text=True, timeout=timeout)
    return (r.stdout + r.stderr).strip()[:3000]


@tool("open_app", "Запустить программу по имени (firefox, pcmanfm, qterminal...)", {"name": S}, 1)
def open_app(name):
    exe = shutil.which(name.split()[0])
    if not exe:
        return f"Не нашла программу {name}"
    subprocess.Popen(shlex.split(name), stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, start_new_session=True)
    return "запущено"


@tool("close_app", "Закрыть программу по имени процесса", {"name": S}, 1)
def close_app(name):
    return _sh(["pkill", "-x", name]) or "ок"


@tool("run_command", "Выполнить shell-команду", {"command": S}, 1)
def run_command(command):
    return _sh(command, 60)


@tool("system_status", "Загрузка CPU, память, диск, батарея", {})
def system_status():
    return _sh("uptime; free -h | head -2; df -h / | tail -1; "
               "sensors 2>/dev/null | head -5")


@tool("list_files", "Список файлов в папке", {"path": S})
def list_files(path):
    p = Path(path).expanduser()
    return "\n".join(sorted(x.name + ("/" if x.is_dir() else "") for x in p.iterdir()))[:3000]


@tool("read_file", "Прочитать текстовый файл", {"path": S})
def read_file(path):
    return Path(path).expanduser().read_text(errors="replace")[:6000]


@tool("write_file", "Записать текст в файл (перезапись)", {"path": S, "content": S}, 1)
def write_file(path, content):
    Path(path).expanduser().write_text(content, encoding="utf-8")
    return "записано"


@tool("find_files", "Найти файлы по части имени в домашней папке", {"query": S})
def find_files(query):
    return _sh(["find", str(Path.home()), "-iname", f"*{query}*", "-not", "-path", "*/.*"])[:3000]


@tool("set_volume", "Громкость 0-100", {"percent": I}, 1)
def set_volume(percent):
    return _sh(f"pactl set-sink-volume @DEFAULT_SINK@ {int(percent)}%") or "ок"


@tool("media", "Управление плеером: play-pause, next, previous", {"action": S}, 1)
def media(action):
    return _sh(["playerctl", action]) or "ок"


@tool("lock_screen", "Заблокировать экран", {}, 1)
def lock_screen():
    return _sh("loginctl lock-session") or "ок"


@tool("shutdown_timer", "Выключить ПК через N минут (0 — отменить)", {"minutes": I}, 1)
def shutdown_timer(minutes):
    return _sh("shutdown -c" if not minutes else f"shutdown -h +{int(minutes)}")


@tool("notify", "Показать уведомление на рабочем столе", {"text": S})
def notify(text):
    return _sh(["notify-send", "Аква", text]) or "ок"


@tool("note_add", "Сохранить заметку", {"text": S})
def note_add(text):
    return f"заметка #{notes.add(text)}"


@tool("note_search", "Найти заметки по слову", {"query": S})
def note_search(query):
    return notes.search(query)


@tool("note_recent", "Последние заметки", {})
def note_recent():
    return notes.recent()


@tool("note_delete", "Удалить заметку по id", {"id": I}, 1)
def note_delete(id):
    notes.delete(int(id))
    return "удалено"
