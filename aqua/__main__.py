import threading
from . import config, web, telegram_bot


def main():
    if config.TG_TOKEN and config.TG_OWNER:
        threading.Thread(target=telegram_bot.run, daemon=True).start()
        print("Telegram: включён")
    elif config.TG_TOKEN:
        print("Telegram: укажи TELEGRAM_OWNER_ID в .env, иначе бот выключен")
    web.run()


if __name__ == "__main__":
    main()
