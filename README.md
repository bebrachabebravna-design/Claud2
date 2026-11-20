# Аква — личный ассистент для Lubuntu

Облачный мозг (Gemini/Claude), управление ПК, заметки, голос, Telegram, защита (подтверждения, dry-run, kill switch).

## Установка
```bash
sudo apt install python3-pip espeak-ng playerctl libnotify-bin pulseaudio-utils
pip install -r requirements.txt
cp .env.example .env   # впиши ключ GEMINI_API_KEY (aistudio.google.com/apikey)
python3 -m aqua
```
Открой http://127.0.0.1:8765

Telegram: токен у @BotFather, свой id у @userinfobot -> в .env.
Голосовой ввод (опционально): `pip install vosk sounddevice` + русская модель Vosk.
