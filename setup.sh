#!/usr/bin/env bash
# Установка Аквы: спрашивает ключи, пишет .env, проверяет Telegram.
set -e
cd "$(dirname "$0")"
echo "== Ставлю пакеты (попросит пароль) =="
sudo apt update -y
sudo apt install -y python3-pip espeak-ng playerctl libnotify-bin pulseaudio-utils curl
pip install -r requirements.txt --break-system-packages 2>/dev/null || pip install -r requirements.txt

echo; echo "== Ключи (ввод скрыт, ничего никуда не отправляется, кроме Telegram/Gemini) =="
read -rsp "Токен бота от @BotFather: " TOK; echo
read -rp  "Твой Telegram id (число от @userinfobot): " UID_
read -rsp "Ключ Gemini (aistudio.google.com/apikey): " GK; echo

echo "== Проверяю токен =="
R=$(curl -s "https://api.telegram.org/bot${TOK}/getMe")
echo "$R" | grep -q '"ok":true' || { echo "Токен не подошёл. Скопируй заново у @BotFather (без пробелов)."; exit 1; }
echo "Бот найден: $(echo "$R" | grep -o '"username":"[^"]*"')"

cat > .env <<ENV
AQUA_NAME=Аква
AQUA_PROVIDER=gemini
GEMINI_API_KEY=${GK}
TELEGRAM_TOKEN=${TOK}
TELEGRAM_OWNER_ID=${UID_}
ENV
chmod 600 .env

curl -s "https://api.telegram.org/bot${TOK}/sendMessage" \
  -d chat_id="${UID_}" -d text="Аква установлена. Запусти: python3 -m aqua" >/dev/null \
  && echo "Тебе в Telegram отправлено тестовое сообщение." \
  || echo "Сообщение не ушло: сначала открой бота и нажми Start."
echo; echo "Готово. Запуск:  python3 -m aqua"
