"""Настройки Аквы. Значения берутся из .env (см. .env.example)."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get("AQUA_DATA", Path.home() / ".aqua"))
DATA.mkdir(parents=True, exist_ok=True)


def _load_env():
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_env()

NAME = os.environ.get("AQUA_NAME", "Аква")
PROVIDER = os.environ.get("AQUA_PROVIDER", "deepseek")  # deepseek | gemini | anthropic
DEEPSEEK_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.environ.get("DEEPSEEK_MODEL", "deepseek-chat")
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5-5")
TG_TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
TG_OWNER = os.environ.get("TELEGRAM_OWNER_ID", "")  # твой числовой id, чужим не отвечаем
PORT = int(os.environ.get("AQUA_PORT", "8765"))

PERSONA = (
    f"Ты {NAME} — личный ассистент пользователя на его Linux-компьютере (Lubuntu). "
    "Общаешься на «ты», коротко, живо, с лёгкой иронией, без канцелярита. "
    "Используй инструменты для действий на ПК и заметок. Опасные действия система "
    "подтверждает сама — не проси подтверждения в тексте. Отвечай по-русски."
)
