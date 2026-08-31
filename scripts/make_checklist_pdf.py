"""Render the lead-magnet checklist to a print-ready A4 PDF.

Chromium is the only PDF engine in this container, so the document is authored
as HTML with @page rules. Fonts are inlined as base64: the renderer runs with
no network, and the container's system fonts have no Cyrillic face worth
handing to a paying reader.
"""
import base64, pathlib, subprocess, tempfile

F = pathlib.Path("/home/user/Claud2/public/fonts")
OUT_HTML = pathlib.Path(tempfile.gettempdir()) / "chek-list.html"
OUT_PDF = pathlib.Path("/home/user/Claud2/deliverables/chek-list-kuda-vnedryat-ii.pdf")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"


def face(family, filename, weight="400", fmt=None, style="normal"):
    data = base64.b64encode((F / filename).read_bytes()).decode()
    fmt = fmt or ("woff2" if filename.endswith(".woff2") else
                  "opentype" if filename.endswith(".otf") else "truetype")
    mime = {"woff2": "font/woff2", "opentype": "font/otf", "truetype": "font/ttf"}[fmt]
    return (f"@font-face{{font-family:'{family}';font-weight:{weight};"
            f"font-style:{style};font-display:swap;"
            f"src:url(data:{mime};base64,{data}) format('{fmt}');}}")


FONTS = "".join([
    face("Body", "Inter-cyrillic.woff2"),
    face("Body", "Inter-latin.woff2"),
    face("Head", "Montserrat-cyrillic.woff2"),
    face("Head", "Montserrat-latin.woff2"),
    face("Display", "BebasNeue-Cyrillic.ttf"),
])

INK = "#15181D"
MUTE = "#5C6572"
LINE = "#E4E7EC"
YEL = "#FFC300"
RED = "#E23A55"
BLUE = "#0E6BF0"

CSS = f"""
{FONTS}
@page {{ size: A4; margin: 16mm 15mm 18mm 15mm; }}
* {{ box-sizing: border-box; }}
html, body {{ margin:0; padding:0; }}
body {{
  font-family: 'Body', 'DejaVu Sans', sans-serif;
  font-size: 10.4pt; line-height: 1.55; color: {INK};
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}}
h1, h2, h3 {{ font-family: 'Head', 'Body', sans-serif; margin: 0; }}
p {{ margin: 0 0 7pt; }}
strong {{ font-weight: 700; }}
a {{ color: {BLUE}; text-decoration: none; font-weight: 600; }}

/* ---- cover block ---- */
.cover {{ border-top: 4pt solid {YEL}; padding-top: 10pt; margin-bottom: 16pt; }}
.eyebrow {{
  font-family:'Head',sans-serif; font-size: 8pt; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase; color: {MUTE};
}}
h1 {{ font-size: 27pt; font-weight: 800; line-height: 1.06; margin: 7pt 0 8pt; letter-spacing: -.01em; }}
h1 em {{ font-style: normal; color: {RED}; }}
.lede {{ font-size: 11pt; color: {MUTE}; margin: 0; }}

.intro {{ margin: 14pt 0 4pt; }}
.howto {{
  background: #FBF7E8; border-left: 3pt solid {YEL};
  padding: 9pt 12pt; margin: 12pt 0 0; font-size: 10pt;
}}

/* ---- section heads ---- */
.sec {{ margin-top: 20pt; }}
h2 {{ page-break-after: avoid; }}
h2 {{
  font-size: 14.5pt; font-weight: 800; letter-spacing: -.01em;
  padding-bottom: 5pt; border-bottom: 1.5pt solid {INK}; margin-bottom: 4pt;
}}
h2 .num {{ color: {YEL}; }}
.sub {{ color: {MUTE}; font-size: 9.6pt; margin: 6pt 0 12pt; }}

/* ---- items ---- */
.item {{ page-break-inside: avoid; margin-bottom: 13pt; }}
.item h3 {{
  font-size: 11.4pt; font-weight: 700; line-height: 1.3;
  display: flex; gap: 8pt; align-items: flex-start; margin-bottom: 5pt;
}}
.box {{
  flex: 0 0 auto; width: 13pt; height: 13pt; margin-top: 1pt;
  border: 1.6pt solid {INK}; border-radius: 2.5pt;
}}
.cross {{
  flex: 0 0 auto; width: 13pt; height: 13pt; margin-top: 1pt;
  border-radius: 2.5pt; background: {RED}; color: #fff;
  font-family:'Body',sans-serif; font-size: 9pt; font-weight: 700;
  line-height: 13pt; text-align: center;
}}
.item .body {{ padding-left: 21pt; }}
.lbl {{
  font-family:'Head',sans-serif; font-size: 7.6pt; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: {MUTE};
  display: block; margin-bottom: 1pt;
}}
.gives {{ border-left: 2.5pt solid {YEL}; padding-left: 9pt; margin-top: 6pt; }}
.gives .lbl {{ color: #A17B00; }}
.fix {{ border-left: 2.5pt solid {BLUE}; padding-left: 9pt; margin-top: 6pt; }}
.fix .lbl {{ color: {BLUE}; }}

/* ---- formula ---- */
.formula {{
  page-break-inside: avoid; border: 1.2pt solid {LINE}; border-radius: 6pt; padding: 12pt 14pt;
  text-align: center; margin: 10pt 0 12pt; background: #FAFBFC;
}}
.formula div {{ font-size: 10.6pt; font-weight: 600; }}
.formula .x {{ font-weight: 700; font-size: 12pt; color: {YEL}; line-height: 1.5; }}

.cases {{ page-break-inside: avoid; display: flex; gap: 10pt; margin-bottom: 9pt; }}
.case {{
  flex: 1; border: 1.2pt solid {LINE}; border-radius: 6pt; padding: 10pt 11pt;
}}
.case .big {{
  font-family:'Display',sans-serif; font-size: 22pt; line-height: 1;
  letter-spacing: .01em; margin-bottom: 3pt;
}}
.case .who {{ font-size: 9.2pt; color: {MUTE}; }}
.note {{ font-size: 9.6pt; color: {MUTE}; font-style: italic; }}

/* ---- questions ---- */
.q {{ page-break-inside: avoid; margin-bottom: 10pt; }}
.q h3 {{ font-size: 11pt; font-weight: 700; margin-bottom: 3pt; }}
.q .ok {{ font-size: 9.9pt; }}
.q .ok b {{ color: #1B8A3E; }}

/* ---- score ---- */
.score {{ page-break-inside: avoid; display: flex; gap: 9pt; margin: 10pt 0 0; }}
.sc {{ flex: 1; border-radius: 6pt; padding: 10pt 11pt; }}
.sc .n {{ font-family:'Head',sans-serif; font-weight: 800; font-size: 19pt; line-height: 1; letter-spacing: -.02em; }}
.sc p {{ margin: 3pt 0 0; font-size: 9.4pt; }}
.sc0 {{ background: #F2F4F7; }} .sc0 .n {{ color: {MUTE}; }}
.sc1 {{ background: #FFF6DB; }} .sc1 .n {{ color: #A17B00; }}
.sc2 {{ background: #FDE9EC; }} .sc2 .n {{ color: {RED}; }}

/* ---- cta ---- */
.cta {{
  page-break-inside: avoid; margin-top: 20pt; border-radius: 8pt;
  background: {INK}; color: #fff; padding: 16pt 18pt;
}}
.cta h2 {{ color: #fff; border: 0; padding: 0; font-size: 16pt; margin-bottom: 6pt; }}
.cta .free {{ color: {YEL}; }}
.cta ul {{ margin: 8pt 0; padding-left: 14pt; }}
.cta li {{ margin-bottom: 3pt; font-size: 10.2pt; }}
.cta .promise {{ color: #C9D0DA; font-size: 10pt; }}
.tg {{
  display: inline-block; margin-top: 10pt; background: {YEL}; color: {INK};
  font-family:'Head',sans-serif; font-weight: 800; font-size: 12pt;
  padding: 8pt 16pt; border-radius: 6pt; text-decoration: none;
}}
.word {{ margin-top: 8pt; font-size: 10pt; color: #C9D0DA; }}
.word b {{ color: #fff; }}

.foot {{
  margin-top: 14pt; padding-top: 9pt; border-top: 1pt solid {LINE};
  font-size: 8.6pt; color: {MUTE}; line-height: 1.5;
}}
.pagebreak {{ page-break-before: always; }}
"""


def item(n, title, check, gives):
    return f"""<div class="item">
  <h3><span class="box"></span><span>{n}. {title}</span></h3>
  <div class="body">
    <p><span class="lbl">Как проверить</span>{check}</p>
    <div class="gives"><span class="lbl">Что это даст</span>{gives}</div>
  </div>
</div>"""


def nope(title, text, fix=None):
    fx = f'<div class="fix"><span class="lbl">Как правильно</span>{fix}</div>' if fix else ""
    return f"""<div class="item">
  <h3><span class="cross">✕</span><span>{title}</span></h3>
  <div class="body"><p>{text}</p>{fx}</div>
</div>"""


GOOD = [
    ("1", "Сотрудники задают друг другу одни и те же вопросы",
     "загляните в рабочий чат за последнюю неделю. Если видите повторяющиеся «а где лежит», "
     "«а какие условия у этого клиента», «а как у нас принято» — это оно.",
     "сотрудник спрашивает у агента обычными словами и получает ответ за 5 секунд, никого не отвлекая. "
     "Освобождается время двоих — и того, кто спросил, и того, кто отвечал. "
     "Обычно это первое, что видно уже на второй неделе."),
    ("2", "Нужная информация лежит больше чем в двух местах",
     "назовите вслух, где у вас хранятся договоры. Если получилось больше двух мест — "
     "сервер, 1С, почта, чаты, чей-то рабочий стол — отмечайте.",
     "одна точка входа вместо пяти. Человеку больше не нужно помнить, что где лежит: он задаёт вопрос, "
     "агент сам находит документ и показывает пункт. Поиск перестаёт быть отдельной работой."),
    ("3", "Есть человек, к которому ходят все",
     "назовите сотрудника, которого дёргают чаще остальных. Назвали за две секунды? Отмечайте.",
     "знания вынимаются из головы одного человека в систему, доступную всем. Он перестаёт быть справочным "
     "бюро и начинает делать свою работу. И главное — его отпуск или увольнение больше не останавливает "
     "часть компании."),
    ("4", "Новичок выходит на нормальную работу дольше месяца",
     "вспомните последнего нанятого. Через сколько он начал работать сам, без вопросов?",
     "новичок задаёт вопросы агенту, а не коллегам, и выходит на самостоятельность за одну-две недели "
     "вместо месяца-двух. Вы быстрее получаете отдачу с найма и не тормозите тех, кто уже зарабатывает."),
    ("5", "Клиент ждёт, пока менеджер что-то уточняет",
     "возьмите обычный клиентский вопрос — про сроки, условия, цену — и засеките секундомером, "
     "за сколько менеджер даст точный ответ. Только не подсказывайте.",
     "менеджер отвечает клиенту в том же разговоре, а не «уточню и вернусь». В B2B чаще покупают не у самого "
     "дешёвого, а у того, кто ответил первым — это напрямую про конверсию, а не только про комфорт."),
    ("6", "Документов много и они регулярно меняются",
     "если у вас есть версии «прайс_итоговый_2_финал» — отмечайте.",
     "агент отвечает по актуальной версии и показывает, из какого пункта взял ответ. Уходит целый класс "
     "ошибок: работа по устаревшему прайсу, старым условиям, отменённому регламенту."),
    ("7", "Уже были потери из-за не найденного вовремя документа",
     "вспомните штраф, сорванный срок или спор с контрагентом, где документ был, но его не нашли.",
     "нужный документ и нужный пункт находятся за секунды — в том числе в споре с контрагентом или "
     "при проверке. Один предотвращённый случай обычно перекрывает всю стоимость внедрения."),
]

BAD = [
    ("В прямую переписку с клиентом",
     "Самая частая и самая дорогая ошибка. Клиент пишет не за информацией — он пишет, чтобы кто-то взял его "
     "вопрос на себя. Как только он понимает, что с ним разговаривает бот, доверие падает, а сложный вопрос "
     "всё равно уходит человеку — только позже и уже с раздражением.",
     "ставьте ИИ не перед клиентом, а за спиной менеджера. Клиенту пишет живой человек, а агент за секунды "
     "достаёт ему условия, пункт договора, сроки, историю. Клиент получает быстрый и точный ответ — "
     "и специалиста, который за этот ответ отвечает."),
    ("Нет боли, просто хочется ИИ",
     "«У всех есть, и нам надо» — худшая причина. Не понимаете, где теряете, — не поймёте, "
     "что изменилось после внедрения.", None),
    ("Задача разовая",
     "Автоматизируют то, что повторяется каждый день. Разовую задачу дешевле сделать руками.", None),
    ("Меньше десяти человек и документов почти нет",
     "Боль есть, но она не набирает суммы. Пока рано.", None),
    ("Публичные нейросети для внутренних документов",
     "Это не «не стоит», это «нельзя». Всё, что вы загружаете в публичный чат-бот, уходит на зарубежные "
     "серверы — вместе с данными ваших контрагентов. По 152-ФЗ отвечать вам. Плюс он ваш договор не знает: "
     "спросите про пункт — придумает, уверенно.", None),
    ("Ждёте, что ИИ заменит людей",
     "Не заменит. Он забирает рутину: поиск, разбор документов, однотипные ответы. Те, кто покупал "
     "«замену отдела», бросали через месяц. Те, кто покупал «убрать рутину», остались.", None),
    ("У вас только графика",
     "Если единственное, что нужно читать, — это чертежи и схемы, текстовый агент тут не поможет. "
     "С текстом — договоры, регламенты, инструкции, сметы в обычных форматах — работает.", None),
]

QUESTIONS = [
    ("Где физически лежат мои данные?",
     "на вашем сервере или на выделенном в РФ. Если данные уходят за границу — "
     "это нарушение 152-ФЗ, и отвечать будете вы."),
    ("Агент отвечает только по моим документам или берёт из интернета?",
     "только по вашим. Если ответа в документах нет — должен честно сказать «не нашёл», а не сочинить."),
    ("Показывает ли он, откуда взял ответ?",
     "да, со ссылкой на конкретный пункт. Ответ, который нельзя проверить, в бизнесе стоит ноль."),
]

HTML = f"""<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>Куда внедрять ИИ, а куда точно нет</title><style>{CSS}</style></head><body>

<div class="cover">
  <div class="eyebrow">Чек-лист для собственника · Нейродокс</div>
  <h1>Куда внедрять ИИ,<br>а куда <em>точно нет</em></h1>
  <p class="lede">Читается за 5 минут. Применяется сегодня.</p>
</div>

<div class="intro">
  <p>Большинство компаний сливают бюджет на ИИ по одной причине: сначала покупают инструмент,
  потом ищут, куда его приткнуть. Правильный порядок обратный — сначала находишь, где именно
  утекают деньги, и только потом смотришь, чем это закрыть.</p>
  <div class="howto"><strong>Как пользоваться.</strong> Идите по списку и отмечайте то, что узнали
  у себя. У каждого пункта написано, что вы проверяете и что получите, если закроете это место.
  В конце — что делать с галочками.</div>
</div>

<div class="sec">
  <h2><span class="num">01.</span> Куда внедрять стоит</h2>
  <p class="sub">Семь признаков. Каждый — место, где ИИ окупается быстрее всего.</p>
  {"".join(item(*g) for g in GOOD)}
</div>

<div class="sec">
  <h2><span class="num">02.</span> Куда внедрять не стоит</h2>
  <p class="sub">Здесь честно: если вы в одном из этих пунктов, деньги лучше не тратить.</p>
  {"".join(nope(*b) for b in BAD)}
</div>

<div class="sec">
  <h2><span class="num">03.</span> Посчитайте свою цифру</h2>
  <p class="sub">Самое полезное, что можно сделать сегодня бесплатно.</p>
  <div class="formula">
    <div>Сотрудников, работающих с документами</div>
    <div class="x">×</div>
    <div>Минут в день на поиск <span style="color:{MUTE};font-weight:400">(засеките, не угадывайте)</span></div>
    <div class="x">×</div>
    <div>Стоимость часа сотрудника с налогами</div>
    <div class="x">×</div>
    <div>21 рабочий день</div>
  </div>
  <div class="cases">
    <div class="case">
      <div class="big">11 мин → 238 000 ₽/мес</div>
      <div class="who">Дистрибьютор бытовой техники, 24 менеджера. Столько занимал ответ на обычный
      вопрос клиента. Собственник был уверен, что это секунд тридцать.</div>
    </div>
    <div class="case">
      <div class="big">15 мин → 150 000 ₽/мес</div>
      <div class="who">Строительная компания, 25 человек. Столько занимал поиск нужного документа.</div>
    </div>
  </div>
  <p class="note">Этих цифр нет в отчётности. Поэтому их и не видят.</p>
</div>

<div class="sec">
  <h2><span class="num">04.</span> Три вопроса подрядчику</h2>
  <p class="sub">Задайте их до того, как переведёте деньги. Ответы отсеивают большинство.</p>
  {"".join(f'<div class="q"><h3>{i+1}. {t}</h3><p class="ok"><b>Правильный ответ:</b> {a}</p></div>'
           for i, (t, a) in enumerate(QUESTIONS))}
  <p>Нет внятного ответа хотя бы на один — ищите дальше.</p>
</div>

<div class="sec">
  <h2>Что делать с галочками</h2>
  <div class="score">
    <div class="sc sc0"><div class="n">0–2</div><p><strong>Рано.</strong> Вернитесь к списку через
    полгода или когда вырастете.</p></div>
    <div class="sc sc1"><div class="n">3–4</div><p><strong>Уже теряете</strong>, но пока терпимо.
    Посчитайте по формуле — увидите сумму, дальше решайте сами.</p></div>
    <div class="sc sc2"><div class="n">5+</div><p><strong>Вы платите за это каждый месяц</strong>,
    просто не видите строку в отчёте. Обычно окупается за один-два месяца.</p></div>
  </div>
</div>

<div class="cta">
  <h2>Насчитали 5 и больше?</h2>
  <p>Посмотрю вашу ситуацию лично — <span class="free">бесплатно, 30–40 минут</span>.</p>
  <ul>
    <li>смотрим, где именно у вас утекает время;</li>
    <li>считаем вашу цифру в рублях;</li>
    <li>говорю прямо, поможет вам ИИ или нет.</li>
  </ul>
  <p class="promise">Если увижу, что не поможем — так и скажу, продавать не буду. Такое бывает.
  Даже если не будем работать вместе, цифра останется у вас — а это уже стоит сорока минут.</p>
  <a class="tg" href="https://t.me/Novikoff_off">Telegram @Novikoff_off</a>
  <div class="word">Просто напишите <b>«аудит»</b> — договоримся о времени.</div>
</div>

<div class="foot">
  <strong>Ярослав Новиков, Нейродокс.</strong> Внедряем ИИ-агентов по внутренним документам компаний:
  сотрудник спрашивает обычными словами и получает ответ за 5 секунд со ссылкой на пункт.
  Локально, серверы в РФ, по 152-ФЗ и NDA. Внедрение под ключ — от 45 000 ₽, срок около 14 дней.
</div>

</body></html>"""

OUT_HTML.write_text(HTML, encoding="utf-8")
subprocess.run([
    CHROME, "--headless", "--disable-gpu", "--no-sandbox",
    "--font-render-hinting=none", "--no-pdf-header-footer",
    "--virtual-time-budget=15000", "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={OUT_PDF}", OUT_HTML.as_uri(),
], check=True, capture_output=True)
size = OUT_PDF.stat().st_size
assert size > 400_000, f"fonts did not embed ({size} bytes) — rerun"
print("PDF", OUT_PDF, size, "bytes")
