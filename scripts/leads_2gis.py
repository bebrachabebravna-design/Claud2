#!/usr/bin/env python3
"""Сбор лидов под Нейродокс из справочника 2ГИС.

Почему 2ГИС, а не Яндекс.Карты: у 2ГИС открытый Catalog API с бесплатным
ключом и отдачей телефонов и сайтов прямо в выдаче. У Яндекса поиск по
организациям тоже есть (search-maps.yandex.ru/v1), но лимиты жёстче и
контакты приходят беднее.

Ключ: https://dev.2gis.ru → «Каталог» → получить API-ключ (бесплатный тариф).
Положи его в переменную окружения DGIS_KEY или впиши ниже.

Запуск:
    export DGIS_KEY=...
    python3 leads_2gis.py

На выходе leads.csv: имя, адрес, телефон, сайт, рубрика, оценка, отзывы, город,
запрос, скоринг. Дальше фильтруешь по скорингу и идёшь по контактам.

ВАЖНО: параметры API могли поменяться — я не мог их проверить из своей среды.
Если выдача пустая, сверься с актуальной докой dev.2gis.ru и поправь FIELDS.
"""

import csv
import os
import time
import urllib.parse
import urllib.request
import json

KEY = os.environ.get("DGIS_KEY", "ВСТАВЬ_КЛЮЧ")
API = "https://catalog.api.2gis.com/3.0/items"
FIELDS = ",".join([
    "items.address",
    "items.contact_groups",
    "items.rubrics",
    "items.reviews",
    "items.org",
    "items.point",
])

# Города по убыванию плотности МСБ нужного профиля.
CITIES = [
    "Москва", "Санкт-Петербург", "Екатеринбург", "Новосибирск",
    "Казань", "Нижний Новгород", "Краснодар", "Ростов-на-Дону",
    "Самара", "Челябинск", "Пермь", "Воронеж",
]

# Запросы сгруппированы по отрасли. Отрасль потом попадает в CSV —
# по ней подбирается текст первого сообщения.
QUERIES = {
    "логистика/ВЭД": [
        "транспортная компания", "грузоперевозки", "логистическая компания",
        "таможенный брокер", "склад ответственного хранения",
        "международные перевозки",
    ],
    "стройка": [
        "строительная компания", "генподрядчик", "проектная организация",
        "монтаж инженерных систем",
    ],
    "производство": [
        "производственная компания", "металлообработка",
        "производство мебели", "завод",
    ],
    "дистрибуция/опт": [
        "оптовая торговля", "дистрибьютор", "оптовая база",
        "поставка оборудования",
    ],
    "юр/бух услуги": [
        "юридическая компания", "бухгалтерские услуги",
        "аутсорсинг бухгалтерии",
    ],
    "медицина": [
        "медицинский центр", "многопрофильная клиника", "стоматология",
    ],
}

# Слова в отзывах, которые прямо указывают на нашу боль. Найденные —
# самый сильный материал для первого сообщения: можно цитировать.
PAIN_WORDS = [
    "долго ждал", "долго отвечают", "не могут найти", "потеряли документ",
    "перекидывают", "никто не знает", "ждал ответа", "не перезвонили",
    "долго оформляют", "путаница в документах", "потеряли договор",
]


def fetch(query, city, page=1, page_size=50):
    params = {
        "q": f"{query} {city}",
        "key": KEY,
        "page": page,
        "page_size": page_size,
        "fields": FIELDS,
    }
    url = f"{API}?{urllib.parse.urlencode(params)}"
    try:
        with urllib.request.urlopen(url, timeout=30) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print(f"  ошибка: {e}")
        return None


def extract_contacts(item):
    phone, site = "", ""
    for group in item.get("contact_groups", []):
        for c in group.get("contacts", []):
            if c.get("type") == "phone" and not phone:
                phone = c.get("value", "")
            if c.get("type") == "website" and not site:
                site = c.get("url") or c.get("value", "")
    return phone, site


def score(item, phone, site):
    """Грубый скоринг: чем выше, тем вероятнее, что боль есть и есть кому платить.

    Логика: нам нужна компания, где несколько человек работают с документами.
    Сайт и много отзывов — косвенный признак, что это не ИП на одного.
    """
    s = 0
    if site:
        s += 2                      # есть сайт — уже не микробизнес
    if phone:
        s += 1
    reviews = (item.get("reviews") or {}).get("general_review_count") or 0
    if reviews >= 50:
        s += 3                      # заметный поток клиентов
    elif reviews >= 15:
        s += 2
    elif reviews >= 5:
        s += 1
    if len(item.get("rubrics") or []) >= 2:
        s += 1                      # несколько направлений = больше регламентов
    org = item.get("org") or {}
    branches = org.get("branch_count") or 0
    if branches >= 3:
        s += 3                      # филиалы = точно есть регламенты и онбординг
    elif branches == 2:
        s += 1
    return s, reviews, branches


def main():
    if KEY == "ВСТАВЬ_КЛЮЧ":
        raise SystemExit("Нет ключа. export DGIS_KEY=... или впиши в файл.")

    seen, rows = set(), []
    for industry, queries in QUERIES.items():
        for query in queries:
            for city in CITIES:
                print(f"{industry} | {query} | {city}")
                data = fetch(query, city)
                items = ((data or {}).get("result") or {}).get("items") or []
                for it in items:
                    name = it.get("name") or ""
                    addr = (it.get("address_name")
                            or (it.get("address") or {}).get("name") or "")
                    dedup = (name.lower().strip(), addr.lower().strip())
                    if not name or dedup in seen:
                        continue
                    seen.add(dedup)
                    phone, site = extract_contacts(it)
                    sc, reviews, branches = score(it, phone, site)
                    rows.append({
                        "оценка": sc,
                        "отрасль": industry,
                        "название": name,
                        "город": city,
                        "адрес": addr,
                        "телефон": phone,
                        "сайт": site,
                        "отзывов": reviews,
                        "филиалов": branches,
                        "рубрика": ", ".join(
                            r.get("name", "") for r in (it.get("rubrics") or [])
                        ),
                        "запрос": query,
                    })
                time.sleep(0.4)     # бережём лимит бесплатного тарифа

    rows.sort(key=lambda r: -r["оценка"])
    with open("leads.csv", "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"\nГотово: {len(rows)} компаний → leads.csv")
    print(f"С оценкой 6+: {sum(1 for r in rows if r['оценка'] >= 6)} — с них и начинай")


if __name__ == "__main__":
    main()
