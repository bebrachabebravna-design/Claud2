<?php
// ================= Нейродокс — движок блога (общие функции) =================
define('DOMAIN', 'https://neirodocs.ru');
define('BLOG_DIR', __DIR__);
define('SITE_ROOT', dirname(__DIR__));
define('DATA_FILE', __DIR__ . '/data/posts.json');
define('BRAND', 'Нейродокс');

function load_posts(): array {
    if (!file_exists(DATA_FILE)) return [];
    $j = json_decode(file_get_contents(DATA_FILE), true);
    return is_array($j) ? $j : [];
}
function save_posts(array $posts): void {
    usort($posts, fn($a,$b) => strcmp($b['date'] ?? '', $a['date'] ?? ''));
    file_put_contents(DATA_FILE, json_encode($posts, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}
function slugify(string $s): string {
    $map = ['а'=>'a','б'=>'b','в'=>'v','г'=>'g','д'=>'d','е'=>'e','ё'=>'e','ж'=>'zh','з'=>'z','и'=>'i','й'=>'y','к'=>'k','л'=>'l','м'=>'m','н'=>'n','о'=>'o','п'=>'p','р'=>'r','с'=>'s','т'=>'t','у'=>'u','ф'=>'f','х'=>'h','ц'=>'c','ч'=>'ch','ш'=>'sh','щ'=>'sch','ъ'=>'','ы'=>'y','ь'=>'','э'=>'e','ю'=>'yu','я'=>'ya',' '=>'-'];
    $s = mb_strtolower(trim($s), 'UTF-8');
    $s = strtr($s, $map);
    $s = preg_replace('/[^a-z0-9\-]/', '', $s);
    $s = preg_replace('/-+/', '-', $s);
    return trim($s, '-') ?: 'article-' . substr(md5($s . microtime()), 0, 6);
}
function e(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
function reading_time(string $html): int {
    $words = str_word_count(strip_tags($html)) ?: mb_strlen(strip_tags($html))/6;
    return max(1, (int)round($words / 150));
}

// ---------- Общая обёртка страницы (шапка/подвал в стиле сайта) ----------
function page_head(string $title, string $desc, string $canonical, string $extra = ''): string {
    $t = e($title); $d = e($desc);
    return <<<HTML
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="yandex-verification" content="02fc3fa5ffdf743b" />
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<title>$t</title>
<meta name="description" content="$d">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="$canonical">
<meta name="theme-color" content="#0A1428">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Нейродокс">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="$t">
<meta property="og:description" content="$d">
<meta property="og:url" content="$canonical">
<meta property="og:image" content="{$GLOBALS['og']}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" href="/assets/fonts/Manrope-800-normal-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/fonts/fonts.css">
$extra
<style>
:root{--page:#F7F8FB;--paper:#FFF;--paper-mute:#EEF1F7;--ink:#0A1428;--t-h:#0A1428;--t-body:#1F2A47;--t-mute:#6B7896;--t-faint:#9099B0;--rule:#E4E8F0;--acc:#1D5DE3;--acc-2:#4D7AFF;--acc-soft:#E0EAFF;--grad-accent:linear-gradient(135deg,#0D3CB8 0%,#1D5DE3 50%,#5B8AFF 100%);--grad-dark:linear-gradient(180deg,#0A1428 0%,#050A1A 100%);--sh-md:0 12px 32px -16px rgba(10,20,40,.12),0 4px 12px -6px rgba(10,20,40,.06);--r-md:16px;--r-lg:24px}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:'Inter',-apple-system,sans-serif;font-size:17px;line-height:1.65;color:var(--t-body);background:var(--page);-webkit-font-smoothing:antialiased}
a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline}
h1,h2,h3,h4{font-family:'Manrope',sans-serif;font-weight:700;line-height:1.15;letter-spacing:-.02em;color:var(--t-h);margin:0}
.italic{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400}
.wrap{width:100%;max-width:820px;margin:0 auto;padding:0 24px}
.wrap-wide{max-width:1180px}
.b-header{position:sticky;top:0;z-index:50;background:rgba(247,248,251,.9);-webkit-backdrop-filter:saturate(180%) blur(16px);backdrop-filter:saturate(180%) blur(16px);border-bottom:1px solid var(--rule)}
.b-header .in{max-width:1240px;margin:0 auto;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;position:relative}
.b-brand{display:flex;align-items:center;gap:12px;font-family:'Manrope',sans-serif;font-weight:700;font-size:1.32rem;letter-spacing:.04em;text-transform:uppercase;color:var(--t-h);line-height:1}
.b-brand:hover{text-decoration:none;opacity:.85}
.b-brand .n1{color:var(--acc)}
.b-nav{display:flex;gap:26px;align-items:center;font-size:.95rem;font-weight:500}
.b-nav a{color:var(--t-mute)}.b-nav a:hover{color:var(--acc);text-decoration:none}
.b-cta{background:#0A1428;color:#fff!important;padding:12px 22px;border-radius:100px;font-weight:600;font-size:.92rem;box-shadow:0 14px 32px -16px rgba(10,20,40,.55)}
.b-cta:hover{text-decoration:none;background:#15213D}
.b-footer{background:linear-gradient(180deg,#0A1428 0%,#050A1A 100%);color:#A0AAC2;margin-top:80px;padding:64px 0 38px}
.b-footer .in{max-width:1240px;margin:0 auto;padding:0 32px}
.b-footer-top{display:grid;grid-template-columns:1.5fr .7fr .8fr;gap:56px;padding-bottom:44px;border-bottom:1px solid rgba(255,255,255,.08)}
.b-footer-brand{font-family:'Manrope',sans-serif;font-weight:700;font-size:1.4rem;letter-spacing:.04em;text-transform:uppercase;color:#fff}
.b-footer-brand .n1{color:#4D7AFF}
.b-footer-brand p{font-family:'Inter',sans-serif;font-weight:400;font-size:.92rem;text-transform:none;letter-spacing:0;color:#8894b0;margin:14px 0 0;max-width:36ch;line-height:1.6}
.b-footer h4{color:#fff;font-size:.94rem;font-weight:600;margin:0 0 18px}
.b-footer ul{list-style:none;padding:0;margin:0}
.b-footer li{margin-bottom:12px;font-size:.95rem}
.b-footer li a{color:#A0AAC2}.b-footer li a:hover{color:#fff;text-decoration:none}
.b-footer-bottom{display:flex;justify-content:space-between;padding-top:28px;font-size:.85rem;color:#6B7896;flex-wrap:wrap;gap:16px}
.b-burger{display:none;flex-direction:column;gap:5px;width:46px;height:46px;border:none;border-radius:50%;background:#0A1428;align-items:center;justify-content:center;cursor:pointer;padding:0}
.b-burger span{display:block;width:20px;height:2px;background:#fff;border-radius:2px;transition:.25s}
body.bnav-open .b-burger span:nth-child(1){transform:translateY(7px) rotate(45deg)}
body.bnav-open .b-burger span:nth-child(2){opacity:0}
body.bnav-open .b-burger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
@media(max-width:820px){.b-footer-top{grid-template-columns:1fr;gap:34px}}
@media(max-width:720px){
  .b-header .in{padding:14px 18px}
  .b-burger{display:flex}
  .b-nav{position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;gap:0;background:var(--paper);border-bottom:1px solid var(--rule);box-shadow:0 20px 40px -20px rgba(10,20,40,.25);padding:8px 18px 18px;max-height:0;overflow:hidden;opacity:0;pointer-events:none;transition:max-height .3s ease,opacity .25s ease}
  body.bnav-open .b-nav{max-height:360px;opacity:1;pointer-events:auto}
  .b-nav a{padding:13px 4px;font-size:1rem;border-bottom:1px solid var(--rule)}
  .b-nav a:last-child{border-bottom:none}
  .b-cta{text-align:center;margin-top:10px}
  .wrap,.wrap-wide{padding:0 18px}
  .posts-grid{gap:16px}
}
HTML;
}
$GLOBALS['og'] = DOMAIN . '/assets/og-cover.jpg';

function chrome_header(): string {
    return <<<HTML
<header class="b-header"><div class="in">
  <a class="b-brand" href="/"><span class="n1">НЕЙРО</span><span>ДОКС</span></a>
  <nav class="b-nav" id="bNav">
    <a href="/product/">Продукт</a>
    <a href="/cases/">Кейсы</a>
    <a href="/blog/">Блог</a>
    <a href="/about/">О нас</a>
    <a class="b-cta" href="/#audit-cta">Записаться на аудит</a>
  </nav>
  <button class="b-burger" id="bBurger" aria-label="Меню">
    <span></span><span></span><span></span>
  </button>
</div></header>
<script>
(function(){
  var burger=document.getElementById('bBurger'), nav=document.getElementById('bNav');
  if(burger&&nav){ burger.addEventListener('click',function(){ document.body.classList.toggle('bnav-open'); }); }
})();
</script>
HTML;
}
function chrome_footer(): string {
    $y = date('Y');
    return <<<HTML
<footer class="b-footer"><div class="in">
  <div class="b-footer-top">
    <div class="b-footer-brand">
      <span class="n1">НЕЙРО</span><span>ДОКС</span>
      <p>Корпоративный ИИ-поиск по внутренней документации компании. Отвечает сотрудникам за секунды со ссылкой на источник.</p>
    </div>
    <div>
      <h4>Разделы</h4>
      <ul>
        <li><a href="/">Главная</a></li>
        <li><a href="/product/">Продукт</a></li>
        <li><a href="/cases/">Кейсы</a></li>
        <li><a href="/about/">О нас</a></li>
        <li><a href="/partner/">Партнёрство</a></li>
        <li><a href="/blog/">Блог</a></li>
      </ul>
    </div>
    <div>
      <h4>Контакты</h4>
      <ul>
        <li><a href="https://t.me/Novikoff_off" target="_blank" rel="noopener">Telegram: @Novikoff_off</a></li>
          <li><a href="https://t.me/Novikoff_official" target="_blank" rel="noopener">Наш Telegram-канал</a></li>
        <li><a href="mailto:neirodocs.support@gmail.com">neirodocs.support@gmail.com</a></li>
      </ul>
    </div>
  </div>
  <div class="b-footer-bottom">
    <div>© $y Нейродокс. Все права защищены.</div>
    <div>ИНН 920002551441</div>
  </div>
</div></footer>
HTML;
}

// ---------- Рендер статьи в статический SEO-файл ----------
function render_article(array $p): string {
    $canonical = DOMAIN . '/blog/' . $p['slug'] . '/';
    // обложка как og:image статьи (должно быть до page_head)
    if (!empty($p['cover'])) {
        $GLOBALS['og'] = (strpos($p['cover'], 'http') === 0) ? $p['cover'] : DOMAIN . $p['cover'];
    }
    $rt = reading_time($p['body']);
    $date = $p['date']; $dfmt = date('d.m.Y', strtotime($date));
    $faqJson = '';
    if (!empty($p['faq'])) {
        $items = [];
        foreach ($p['faq'] as $f) {
            $items[] = ['@type'=>'Question','name'=>$f['q'],'acceptedAnswer'=>['@type'=>'Answer','text'=>$f['a']]];
        }
        $faqData = ['@context'=>'https://schema.org','@type'=>'FAQPage','mainEntity'=>$items];
        $faqJson = '<script type="application/ld+json">'.json_encode($faqData, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).'</script>';
    }
    $articleData = [
        '@context'=>'https://schema.org','@type'=>'Article',
        'headline'=>$p['title'],'description'=>$p['excerpt'],
        'datePublished'=>$date,'dateModified'=>$p['updated'] ?? $date,
        'author'=>['@type'=>'Organization','name'=>'Нейродокс'],
        'publisher'=>['@type'=>'Organization','name'=>'Нейродокс','url'=>DOMAIN.'/'],
        'mainEntityOfPage'=>$canonical,
    ];
    $breadcrumb = [
        '@context'=>'https://schema.org','@type'=>'BreadcrumbList','itemListElement'=>[
            ['@type'=>'ListItem','position'=>1,'name'=>'Главная','item'=>DOMAIN.'/'],
            ['@type'=>'ListItem','position'=>2,'name'=>'Блог','item'=>DOMAIN.'/blog/'],
            ['@type'=>'ListItem','position'=>3,'name'=>$p['title'],'item'=>$canonical],
        ]
    ];
    $extra = '<meta name="keywords" content="'.e($p['keywords'] ?? '').'">'
        . '<script type="application/ld+json">'.json_encode($articleData, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).'</script>'
        . '<script type="application/ld+json">'.json_encode($breadcrumb, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).'</script>'
        . $faqJson;
    $head = page_head($p['title'].' — Блог Нейродокс', $p['excerpt'], $canonical, $extra);
    $body = $p['body'];
    $faqHtml = '';
    if (!empty($p['faq'])) {
        $faqHtml = '<section class="art-faq"><h2>Частые вопросы</h2>';
        foreach ($p['faq'] as $f) {
            $faqHtml .= '<div class="art-faq-item"><h3>'.e($f['q']).'</h3><p>'.e($f['a']).'</p></div>';
        }
        $faqHtml .= '</section>';
    }
    $q = e($p['question'] ?? $p['title']);
    $coverHtml = '';
    if (!empty($p['cover'])) {
        $coverHtml = '<div class="art-cover"><img src="'.e($p['cover']).'" alt="'.e($p['title']).'" loading="eager"></div>';
    }
    $css = <<<CSS
.art-css{}
.art-hero{padding:52px 0 28px}
.breadcrumb{font-size:.85rem;color:var(--t-faint);margin-bottom:20px}
.breadcrumb a{color:var(--t-mute)}
.art-q{display:inline-block;background:var(--acc-soft);color:var(--acc);font-weight:600;font-size:.82rem;padding:6px 14px;border-radius:99px;margin-bottom:18px}
.art-title{font-size:clamp(1.9rem,4.4vw,2.9rem);line-height:1.1;letter-spacing:-.028em}
.art-meta{display:flex;gap:16px;flex-wrap:wrap;color:var(--t-faint);font-size:.9rem;margin-top:20px;align-items:center}
.art-meta .dot{width:4px;height:4px;border-radius:50%;background:var(--t-faint)}
.art-body{font-size:1.12rem;line-height:1.72;color:var(--t-body);padding-top:8px}
.art-cover{max-width:900px;margin:0 auto 8px;padding:0 24px}
.art-cover img{width:100%;max-height:440px;object-fit:cover;border-radius:var(--r-lg);box-shadow:0 24px 60px -28px rgba(10,20,40,.35)}
.art-body h2{font-size:1.6rem;margin:40px 0 16px;letter-spacing:-.02em}
.art-body h3{font-size:1.25rem;margin:30px 0 12px}
.art-body p{margin:0 0 20px}
.art-body ul,.art-body ol{margin:0 0 20px;padding-left:24px}
.art-body li{margin-bottom:8px}
.art-body blockquote{border-left:3px solid var(--acc);background:var(--paper-mute);margin:24px 0;padding:16px 22px;border-radius:0 var(--r-md) var(--r-md) 0;color:var(--t-h);font-size:1.08rem}
.art-body a{text-decoration:underline}
.art-body img{max-width:100%;height:auto;border-radius:var(--r-md);margin:26px auto;display:block;box-shadow:0 16px 40px -22px rgba(10,20,40,.28)}
.art-body strong{color:var(--t-h);font-weight:600}
.art-faq{margin-top:56px;border-top:1px solid var(--rule);padding-top:36px}
.art-faq h2{font-size:1.6rem;margin-bottom:22px}
.art-faq-item{background:var(--paper);border:1px solid var(--rule);border-radius:var(--r-md);padding:20px 24px;margin-bottom:14px;box-shadow:var(--sh-md)}
.art-faq-item h3{font-size:1.1rem;margin-bottom:8px;color:var(--t-h)}
.art-faq-item p{margin:0;color:var(--t-mute)}
.art-cta{margin-top:56px;background:var(--grad-dark);color:#fff;border-radius:var(--r-lg);padding:44px 40px;text-align:center;box-shadow:var(--sh-md)}
.art-cta h2{color:#fff;font-size:1.7rem;margin-bottom:12px}
.art-cta p{color:#C3D0EA;max-width:520px;margin:0 auto 24px}
.art-cta a{display:inline-block;background:var(--grad-accent);color:#fff!important;padding:14px 30px;border-radius:99px;font-weight:600;text-decoration:none;box-shadow:0 14px 34px -12px rgba(29,93,227,.7)}
.back-link{display:inline-block;margin-top:40px;color:var(--t-mute);font-weight:500}
CSS;
    $header = chrome_header(); $footer = chrome_footer();
    return $head."\n<style>$css</style>\n<!-- Yandex.Metrika counter -->
<script type=\"text/javascript\">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110861876', 'ym');

    ym(110861876, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:\"dataLayer\", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>
<noscript><div><img src=\"https://mc.yandex.ru/watch/110861876\" style=\"position:absolute; left:-9999px;\" alt=\"\" /></div></noscript>
<!-- /Yandex.Metrika counter -->
</head>\n<body>\n$header
<article class=\"art-css\">
  <div class=\"art-hero\"><div class=\"wrap\">
    <div class=\"breadcrumb\"><a href=\"/\">Главная</a> → <a href=\"/blog/\">Блог</a> → {$q}</div>
    <span class=\"art-q\">Отвечаем на вопрос</span>
    <h1 class=\"art-title\">".e($p['title'])."</h1>
    <div class=\"art-meta\"><span>Нейродокс</span><span class=\"dot\"></span><time datetime=\"$date\">$dfmt</time><span class=\"dot\"></span><span>$rt мин чтения</span></div>
  </div></div>
  $coverHtml
  <div class=\"wrap\">
    <div class=\"art-body\">$body</div>
    $faqHtml
    <div class=\"art-cta\">
      <h2>Хотите такой же ИИ-агент для своей компании?</h2>
      <p>На бесплатном аудите разберём ваши процессы, покажем кейсы конкурентов и дадим чек-лист по нейросетям для бизнеса.</p>
      <a href=\"/#audit-cta\">Записаться на аудит</a>
    </div>
    <a class=\"back-link\" href=\"/blog/\">← Все статьи блога</a>
  </div>
</article>
<!-- Подписка на Telegram-канал -->
<div class=\"wrap\" style=\"margin:52px auto 12px;\">
  <div style=\"max-width:760px;margin:0 auto;background:linear-gradient(135deg,#0D3CB8 0%,#1D5DE3 60%,#5B8AFF 100%);border-radius:20px;padding:36px 34px;color:#fff;text-align:center;\">
    <div style=\"font-weight:800;font-size:1.35rem;margin-bottom:8px;\">Telegram-канал о внедрении ИИ в бизнес</div>
    <p style=\"margin:0 0 20px;color:rgba(255,255,255,.9);font-size:1.02rem;\">Разборы внедрений, приёмы работы с нейросетями и новости проекта.</p>
    <a href=\"https://t.me/Novikoff_official\" target=\"_blank\" rel=\"noopener\" style=\"display:inline-flex;align-items:center;gap:10px;background:#fff;color:#0D3CB8;font-weight:700;padding:13px 26px;border-radius:999px;text-decoration:none;\">
      <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M9.04 15.51l-.38 5.34c.54 0 .78-.23 1.06-.51l2.55-2.44 5.28 3.87c.97.53 1.65.25 1.91-.9l3.46-16.2c.31-1.43-.52-1.99-1.46-1.64L1.13 10.87c-1.39.54-1.37 1.31-.24 1.66l5.2 1.62L18.16 6.5c.57-.37 1.09-.17.66.2L9.04 15.51z\"/></svg>
      Подписаться на канал
    </a>
  </div>
</div>

$footer
</body>
</html>";
}

// ---------- Рендер списка блога (статический index.html с поиском) ----------
function render_index(array $posts): string {
    $canonical = DOMAIN . '/blog/';
    $extra = '<meta name="keywords" content="блог про ии для бизнеса, что такое ии агент, сколько стоит внедрение ии, как внедрить нейросеть в компанию, как автоматизировать работу с документами, как автоматизировать документооборот в компании, автоматизация документооборота, как навести порядок в документах компании, сотрудники долго ищут документы, сотрудники тратят время на поиск информации, как сократить время на поиск документов, быстрый поиск по документам компании, поиск по внутренним документам организации, как создать базу знаний для сотрудников, корпоративная база знаний, база знаний для компании, единая база знаний для бизнеса, где хранить регламенты компании, как разгрузить сотрудников от рутины, автоматизация рутинных задач в бизнесе, как ускорить ответы клиентам, менеджеры долго отвечают клиентам, как ускорить обработку заявок, как быстро адаптировать нового сотрудника, онбординг новых сотрудников, как передать знания при увольнении сотрудника, как подготовиться к проверке документов, штраф за непредоставленный документ, ии агент по документам, ии агент для бизнеса, нейросеть для работы с документами, ии для документооборота, умный поиск по документам, ии помощник для сотрудников, цифровой помощник для бизнеса, внедрение ии в компанию, внедрение искусственного интеллекта в бизнес, искусственный интеллект для бизнеса, нейросети для бизнеса, ии для малого бизнеса, ии для среднего бизнеса">';
    // Blog schema
    $blogData = ['@context'=>'https://schema.org','@type'=>'Blog','name'=>'Блог Нейродокс','url'=>$canonical,
        'blogPost'=>array_map(fn($p)=>['@type'=>'BlogPosting','headline'=>$p['title'],'url'=>DOMAIN.'/blog/'.$p['slug'].'/','datePublished'=>$p['date']], $posts)];
    $extra .= '<script type="application/ld+json">'.json_encode($blogData, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES).'</script>';
    $head = page_head('Блог о внедрении ИИ в бизнес — Нейродокс',
        'Разборы, гайды и кейсы по внедрению ИИ-агентов в бизнес: как автоматизировать поддержку, базу знаний и работу с документами.',
        $canonical, $extra);
    $cards = '';
    $searchData = [];
    foreach ($posts as $i => $p) {
        $url = '/blog/'.$p['slug'].'/';
        $dfmt = date('d.m.Y', strtotime($p['date']));
        $rt = reading_time($p['body']);
        // обложка: своя картинка или аккуратный фирменный плейсхолдер с инициалом
        if (!empty($p['cover'])) {
            $cover = '<div class="pc-cover"><img src="'.e($p['cover']).'" alt="'.e($p['title']).'" loading="lazy"></div>';
        } else {
            $letter = mb_strtoupper(mb_substr(trim($p['title']), 0, 1, 'UTF-8'), 'UTF-8');
            $cover = '<div class="pc-cover pc-cover-ph"><span>'.e($letter).'</span></div>';
        }
        $cards .= '<a class="post-card" href="'.$url.'" data-search="'.e(mb_strtolower($p['title'].' '.($p['question']??'').' '.($p['keywords']??''))).'">'
            . $cover
            . '<div class="pc-body">'
            . '<div class="pc-q">'.e($p['question'] ?? 'Статья').'</div>'
            . '<h2 class="pc-title">'.e($p['title']).'</h2>'
            . '<p class="pc-ex">'.e($p['excerpt']).'</p>'
            . '<div class="pc-meta"><time>'.$dfmt.'</time><span class="dot"></span><span>'.$rt.' мин</span></div>'
            . '</div>'
            . '</a>';
    }
    if (!$cards) $cards = '<p style="color:var(--t-mute);grid-column:1/-1">Пока нет опубликованных статей.</p>';
    $css = <<<CSS
.blog-hero{padding:60px 0 34px}
.blog-hero .eyebrow{display:inline-block;font-size:.74rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:var(--acc);margin-bottom:14px}
.blog-hero h1{font-size:clamp(2.1rem,5vw,3.2rem);letter-spacing:-.03em}
.blog-hero p{color:var(--t-mute);font-size:1.12rem;max-width:640px;margin:16px 0 0}
.blog-search{margin:30px 0 0;position:relative;max-width:560px}
.blog-search input{width:100%;padding:15px 18px 15px 48px;border:1px solid var(--rule);border-radius:99px;background:var(--paper);font:inherit;font-size:1rem;color:var(--t-h);box-shadow:var(--sh-md);outline:none}
.blog-search input:focus{border-color:var(--acc)}
.blog-search svg{position:absolute;left:18px;top:50%;transform:translateY(-50%);color:var(--t-faint)}
.posts-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;padding:20px 0 0}
@media(max-width:760px){.posts-grid{grid-template-columns:1fr}}
.post-card{display:flex;flex-direction:column;background:var(--paper);border:1px solid var(--rule);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-md);transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s,border-color .3s}
.post-card:hover{transform:translateY(-4px);border-color:var(--acc);box-shadow:0 24px 50px -20px rgba(29,93,227,.28);text-decoration:none}
.pc-cover{aspect-ratio:16/9;overflow:hidden;background:var(--paper-mute)}
.pc-cover img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s cubic-bezier(.16,1,.3,1)}
.post-card:hover .pc-cover img{transform:scale(1.04)}
.pc-cover-ph{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0D3CB8 0%,#1D5DE3 55%,#5B8AFF 100%)}
.pc-cover-ph span{font-family:'Manrope',sans-serif;font-weight:800;font-size:3.4rem;color:rgba(255,255,255,.92)}
.pc-body{display:flex;flex-direction:column;flex:1;padding:24px 26px 26px}
.pc-q{font-size:.78rem;font-weight:600;color:var(--acc);background:var(--acc-soft);align-self:flex-start;padding:5px 12px;border-radius:99px;margin-bottom:14px}
.pc-title{font-size:1.3rem;line-height:1.22;margin-bottom:10px;color:var(--t-h)}
.pc-ex{color:var(--t-mute);font-size:1rem;margin:0 0 18px;flex:1}
.pc-meta{display:flex;align-items:center;gap:10px;color:var(--t-faint);font-size:.85rem}
.pc-meta .dot{width:4px;height:4px;border-radius:50%;background:var(--t-faint)}
.no-res{grid-column:1/-1;color:var(--t-mute);padding:20px 0}
CSS;
    $header = chrome_header(); $footer = chrome_footer();
    return $head."\n<style>$css</style>\n</head>\n<body>\n$header
<section class=\"blog-hero\"><div class=\"wrap wrap-wide\">
  <span class=\"eyebrow\">Блог Нейродокс</span>
  <h1>Как ИИ меняет работу <span class=\"italic\" style=\"color:var(--acc)\">бизнеса</span></h1>
  <p>Разбираем на понятном языке: как внедрять ИИ-агентов, автоматизировать поддержку и базу знаний, и считать окупаемость.</p>
  <div class=\"blog-search\">
    <svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-3.5-3.5\" stroke-linecap=\"round\"/></svg>
    <input id=\"blogSearch\" type=\"search\" placeholder=\"Задайте вопрос — например, «как автоматизировать поддержку»\" autocomplete=\"off\">
  </div>
</div></section>
<div class=\"wrap wrap-wide\"><div class=\"posts-grid\" id=\"postsGrid\">$cards</div></div>
$footer
<script>
(function(){
  var inp=document.getElementById('blogSearch'), grid=document.getElementById('postsGrid');
  if(!inp) return;
  var cards=[].slice.call(grid.querySelectorAll('.post-card'));
  var noRes=document.createElement('p'); noRes.className='no-res'; noRes.textContent='Ничего не нашли по вашему вопросу. Напишите нам — ответим лично.'; noRes.style.display='none'; grid.appendChild(noRes);
  inp.addEventListener('input',function(){
    var q=inp.value.trim().toLowerCase(), shown=0;
    cards.forEach(function(c){
      var hit=!q || c.getAttribute('data-search').indexOf(q)>-1;
      c.style.display=hit?'':'none'; if(hit)shown++;
    });
    noRes.style.display=shown?'none':'';
  });
})();
</script>
</body>
</html>";
}

// ---------- Пересборка всего блога ----------
function rebuild_all(): void {
    $posts = load_posts();
    foreach ($posts as $p) {
        $dir = BLOG_DIR . '/' . $p['slug'];
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        file_put_contents($dir . '/index.html', render_article($p));
    }
    file_put_contents(BLOG_DIR . '/index.html', render_index($posts));
    rebuild_sitemap($posts);
}

function rebuild_sitemap(array $posts): void {
    $urls = [
        ['loc'=>DOMAIN.'/', 'pri'=>'1.0'],
        ['loc'=>DOMAIN.'/product/', 'pri'=>'0.9'],
        ['loc'=>DOMAIN.'/cases/', 'pri'=>'0.8'],
        ['loc'=>DOMAIN.'/about/', 'pri'=>'0.6'],
        ['loc'=>DOMAIN.'/partner/', 'pri'=>'0.6'],
        ['loc'=>DOMAIN.'/blog/', 'pri'=>'0.8'],
    ];
    foreach ($posts as $p) $urls[] = ['loc'=>DOMAIN.'/blog/'.$p['slug'].'/', 'pri'=>'0.7', 'lastmod'=>substr($p['updated'] ?? $p['date'],0,10)];
    // Дедупликация на всякий случай: одинаковых <loc> в sitemap быть не должно —
    // Яндекс/Google игнорируют дубли и это может понизить доверие к sitemap.
    $seen = []; $urls = array_values(array_filter($urls, function($u) use (&$seen){
        if (isset($seen[$u['loc']])) return false; $seen[$u['loc']] = true; return true;
    }));
    $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
    foreach ($urls as $u) {
        $xml .= "  <url>\n    <loc>{$u['loc']}</loc>\n";
        if (!empty($u['lastmod'])) $xml .= "    <lastmod>{$u['lastmod']}</lastmod>\n";
        $xml .= "    <priority>{$u['pri']}</priority>\n  </url>\n";
    }
    $xml .= '</urlset>';
    file_put_contents(SITE_ROOT . '/sitemap.xml', $xml);
}
