<?php
require __DIR__ . '/config.php';
require __DIR__ . '/lib.php';
session_name(SESSION_NAME);
session_start();

// ---------- Auth ----------
if (isset($_GET['logout'])) { session_destroy(); header('Location: admin.php'); exit; }
$authed = !empty($_SESSION['ndx_ok']);
if (!$authed && ($_POST['action'] ?? '') === 'login') {
    if (password_verify($_POST['password'] ?? '', ADMIN_PASS_HASH)) {
        $_SESSION['ndx_ok'] = true; header('Location: admin.php'); exit;
    } else { $login_err = 'Неверный пароль'; }
}
if (!$authed) {
    ?><!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Вход — редактор блога</title>
    <style>body{font-family:system-ui,sans-serif;background:#0A1428;color:#EAF0FC;display:grid;place-items:center;height:100vh;margin:0}.card{background:#0F1732;border:1px solid rgba(255,255,255,.1);padding:34px;border-radius:18px;width:320px}h1{font-size:18px;margin:0 0 4px}p{color:#9AA6C4;font-size:13px;margin:0 0 20px}input{width:100%;padding:12px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#141E40;color:#fff;font-size:15px;margin-bottom:12px;box-sizing:border-box}button{width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#1D5DE3,#5B8AFF);color:#fff;font-weight:600;font-size:15px;cursor:pointer}.err{color:#FF9B9B;font-size:13px;margin-bottom:10px}</style></head>
    <body><form class="card" method="post"><h1>Редактор блога Нейродокс</h1><p>Доступ только для владельца</p>
    <?php if(!empty($login_err)) echo '<div class="err">'.e($login_err).'</div>'; ?>
    <input type="hidden" name="action" value="login"><input type="password" name="password" placeholder="Пароль" autofocus>
    <button type="submit">Войти</button></form></body></html><?php
    exit;
}

// ---------- Лёгкая очистка HTML из редактора (owner-only, но убираем опасное) ----------
function clean_body(string $html): string {
    // убрать script/style/iframe и обработчики on*, javascript:
    $html = preg_replace('#<(script|style|iframe|object|embed)[^>]*>.*?</\1>#is', '', $html);
    $html = preg_replace('#\son[a-z]+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)#i', '', $html);
    $html = preg_replace('#(href|src)\s*=\s*(["\']?)\s*javascript:[^"\'>]*\2#i', '$1="#"', $html);
    // почистить пустые параграфы
    $html = preg_replace('#<p>(\s|&nbsp;|<br\s*/?>)*</p>#i', '', $html);
    return trim($html);
}

// ---------- Actions ----------
$msg = ''; $msgType = 'ok';
$posts = load_posts();
$editing = null;

if (($_POST['action'] ?? '') === 'save') {
    $title = trim($_POST['title'] ?? '');
    $body = clean_body($_POST['body'] ?? '');
    if ($title && $body && strip_tags($body) !== '') {
        $slug = trim($_POST['slug'] ?? '') ?: slugify($title);
        // Гарантия уникальности URL: если такой slug уже есть у ДРУГОЙ статьи,
        // добавляем -2, -3 и т.д. Это защита от каннибализации URL — двух статей
        // по одному адресу быть не может, sitemap не получит дубликат.
        $orig = $_POST['orig_slug'] ?? '';
        $base = $slug; $n = 2;
        while (true) {
            $collision = false;
            foreach ($posts as $pp) {
                if ($pp['slug'] === $slug && $pp['slug'] !== $orig) { $collision = true; break; }
            }
            if (!$collision) break;
            $slug = $base . '-' . $n++;
        }
        $faq = [];
        foreach (preg_split('/\r?\n/', $_POST['faq'] ?? '') as $line) {
            if (strpos($line, '::') !== false) { [$q,$a] = array_map('trim', explode('::', $line, 2)); if($q&&$a) $faq[] = ['q'=>$q,'a'=>$a]; }
        }
        $cover = trim($_POST['cover'] ?? '');
        $now = date('c');
        $found = false;
        foreach ($posts as &$p) {
            if ($p['slug'] === $orig) {
                if ($orig !== $slug && is_dir(BLOG_DIR.'/'.$orig)) { @unlink(BLOG_DIR.'/'.$orig.'/index.html'); @rmdir(BLOG_DIR.'/'.$orig); }
                $p = ['slug'=>$slug,'title'=>$title,'question'=>trim($_POST['question']??''),'excerpt'=>trim($_POST['excerpt']??''),
                      'keywords'=>trim($_POST['keywords']??''),'cover'=>$cover,'body'=>$body,'faq'=>$faq,
                      'date'=>$p['date'],'updated'=>$now]; $found = true; break;
            }
        }
        unset($p);
        if (!$found) {
            $posts[] = ['slug'=>$slug,'title'=>$title,'question'=>trim($_POST['question']??''),'excerpt'=>trim($_POST['excerpt']??''),
                        'keywords'=>trim($_POST['keywords']??''),'cover'=>$cover,'body'=>$body,'faq'=>$faq,'date'=>$now,'updated'=>$now];
        }
        save_posts($posts);
        rebuild_all();
        $msg = 'Статья опубликована и уже на сайте: /blog/'.$slug.'/';
        // Мягкое предупреждение о каннибализации: похожие заголовки/ключи у других
        // статей могут делить между собой позиции в Google. Автор увидит подсказку
        // и сможет уточнить угол либо объединить статьи.
        $dupes = [];
        $norm = function(string $s){ return preg_replace('/\s+/', ' ', mb_strtolower(preg_replace('/[^a-zа-яё0-9\s]/iu', ' ', $s))); };
        $tKey = $norm($title);
        $kKey = $norm(trim($_POST['keywords'] ?? ''));
        foreach ($posts as $pp) {
            if ($pp['slug'] === $slug) continue;
            $sim = similar_text($tKey, $norm($pp['title']), $pct); if ($pct === null) $pct = 0;
            $kk  = $kKey && !empty($pp['keywords']) ? $norm($pp['keywords']) : '';
            $kOverlap = ($kk && $kKey && count(array_intersect(explode(',', $kKey), explode(',', $kk))) >= 2);
            if ($pct >= 65 || $kOverlap) $dupes[] = $pp['title'];
        }
        if ($dupes) $msg .= ' ⚠ Похожие статьи (риск каннибализации в поиске): «' . implode('», «', array_slice($dupes,0,3)) . '». Разведите их по углу или объедините.';
        $posts = load_posts();
    } else { $msg = 'Заполните заголовок и текст статьи.'; $msgType = 'err'; }
}

if (($_GET['delete'] ?? '') !== '') {
    $del = $_GET['delete'];
    foreach ($posts as $k=>$p) if ($p['slug']===$del) {
        if (is_dir(BLOG_DIR.'/'.$del)) { @unlink(BLOG_DIR.'/'.$del.'/index.html'); @rmdir(BLOG_DIR.'/'.$del); }
        unset($posts[$k]);
    }
    $posts = array_values($posts); save_posts($posts); rebuild_all();
    $msg = 'Статья удалена.';
}

if (($_GET['edit'] ?? '') !== '') {
    foreach ($posts as $p) if ($p['slug'] === $_GET['edit']) $editing = $p;
}
$faqText = '';
if ($editing && !empty($editing['faq'])) foreach ($editing['faq'] as $f) $faqText .= $f['q'].' :: '.$f['a']."\n";
?><!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Редактор блога — Нейродокс</title>
<style>
:root{--acc:#1D5DE3}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#F1F4FA;color:#0A1428}
.top{background:#0A1428;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:20}
.top b{font-weight:700}.top a{color:#9DB2DA;text-decoration:none;font-size:14px;margin-left:18px}
.grid{display:grid;grid-template-columns:1fr 340px;gap:24px;max-width:1200px;margin:24px auto;padding:0 24px}
@media(max-width:900px){.grid{grid-template-columns:1fr}}
.card{background:#fff;border:1px solid #E4E8F0;border-radius:16px;padding:24px;box-shadow:0 8px 24px -16px rgba(10,20,40,.2)}
label{display:block;font-size:13px;font-weight:600;color:#4B5876;margin:16px 0 6px}
label:first-child{margin-top:0}
input[type=text],textarea{width:100%;padding:11px 13px;border:1px solid #D8DEEA;border-radius:10px;font:inherit;font-size:15px;color:#0A1428;background:#fff}
input:focus,textarea:focus,.editor:focus{outline:none;border-color:var(--acc)}
textarea{resize:vertical}
.hint{font-size:12px;color:#8492AE;margin-top:4px}
.btn{background:linear-gradient(135deg,#1D5DE3,#5B8AFF);color:#fff;border:none;padding:13px 22px;border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;margin-top:20px}
.btn:disabled{opacity:.6;cursor:default}
.toolbar{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin:6px 0 0;padding:8px;background:#F4F7FD;border:1px solid #D8DEEA;border-bottom:none;border-radius:10px 10px 0 0;position:sticky;top:56px;z-index:10}
.toolbar button{background:#fff;border:1px solid #D8DEEA;border-radius:8px;padding:7px 11px;font-size:13px;cursor:pointer;font-weight:600;color:#1F2A47;line-height:1;min-height:32px}
.toolbar button:hover{background:#E0EAFF;border-color:var(--acc);color:var(--acc)}
.toolbar button.active{background:var(--acc);border-color:var(--acc);color:#fff}
.tb-sep{width:1px;align-self:stretch;background:#D8DEEA;margin:2px 3px}
.editor{min-height:340px;max-height:70vh;overflow-y:auto;border:1px solid #D8DEEA;border-radius:0 0 10px 10px;padding:18px 20px;font-size:16px;line-height:1.65;color:#1F2A47;background:#fff}
.editor:empty::before{content:attr(data-ph);color:#9AA6C4}
.editor h2{font-size:1.5rem;margin:22px 0 10px;font-weight:700;line-height:1.2}
.editor h3{font-size:1.2rem;margin:18px 0 8px;font-weight:700}
.editor p{margin:0 0 14px}
.editor ul,.editor ol{margin:0 0 14px;padding-left:24px}
.editor blockquote{border-left:3px solid var(--acc);background:#F4F7FD;margin:16px 0;padding:12px 18px;border-radius:0 10px 10px 0;color:#0A1428}
.editor img{max-width:100%;border-radius:12px;margin:14px 0;display:block}
.editor a{color:var(--acc)}
.msg{background:#E0EAFF;border:1px solid var(--acc);color:#0D3CB8;padding:12px 16px;border-radius:10px;margin-bottom:18px;font-size:14px}
.msg.err{background:#FDE7E7;border-color:#DC4B4B;color:#B02323}
.plist{list-style:none;padding:0;margin:0}
.plist li{padding:12px 0;border-bottom:1px solid #EEF1F7}
.plist li:last-child{border:none}
.plist a{color:#0A1428;text-decoration:none;font-weight:600;font-size:14px}
.plist .row{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:6px}
.plist .acts a{font-size:12px;color:var(--acc);margin-right:12px}
.plist .acts a.del{color:#DC4B4B}
.side-h{font-size:14px;font-weight:700;margin:0 0 14px;color:#4B5876}
h2.page{font-size:18px;margin:0 0 18px}
.cover-box{display:flex;align-items:center;gap:14px;margin-top:6px}
.cover-box img{width:120px;height:70px;object-fit:cover;border-radius:10px;border:1px solid #D8DEEA;display:none}
.cover-box img.show{display:block}
.cover-btn{background:#EEF1F7;border:1px solid #D8DEEA;border-radius:8px;padding:9px 14px;font-size:13px;cursor:pointer;font-weight:600;color:#1F2A47}
.cover-btn:hover{background:#E0EAFF;border-color:var(--acc);color:var(--acc)}
.cover-clear{font-size:12px;color:#DC4B4B;cursor:pointer;display:none}
.uploading{font-size:12px;color:#8492AE}
</style></head>
<body>
<div class="top"><b>✍ Редактор блога Нейродокс</b><div><a href="/blog/" target="_blank">Открыть блог ↗</a><a href="?logout=1">Выйти</a></div></div>
<div class="grid">
  <div class="card">
    <h2 class="page"><?= $editing ? 'Редактирование статьи' : 'Новая статья' ?></h2>
    <?php if($msg) echo '<div class="msg '.($msgType==='err'?'err':'').'">'.e($msg).'</div>'; ?>
    <form method="post" id="postForm">
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="orig_slug" value="<?= e($editing['slug'] ?? '') ?>">
      <input type="hidden" name="body" id="bodyField">
      <input type="hidden" name="cover" id="coverField" value="<?= e($editing['cover'] ?? '') ?>">

      <label>Заголовок статьи</label>
      <input type="text" name="title" required placeholder="Как ИИ-агент отвечает по внутренним документам" value="<?= e($editing['title'] ?? '') ?>">

      <label>Вопрос клиента (по нему статья находится в поиске)</label>
      <input type="text" name="question" placeholder="Как автоматизировать поддержку сотрудников?" value="<?= e($editing['question'] ?? '') ?>">
      <div class="hint">Формулируйте как реальный запрос клиента в Google/Яндекс.</div>

      <label>Короткое описание (показывается в поиске, до 160 символов)</label>
      <input type="text" name="excerpt" maxlength="200" placeholder="1–2 предложения, о чём статья" value="<?= e($editing['excerpt'] ?? '') ?>">

      <label>Ключевые слова (через запятую)</label>
      <input type="text" name="keywords" placeholder="ии агент, автоматизация поддержки, база знаний" value="<?= e($editing['keywords'] ?? '') ?>">

      <label>Обложка статьи (картинка вверху, необязательно)</label>
      <div class="cover-box">
        <img id="coverPreview" src="<?= e($editing['cover'] ?? '') ?>" class="<?= !empty($editing['cover'])?'show':'' ?>" alt="">
        <button type="button" class="cover-btn" id="coverBtn">Загрузить обложку</button>
        <span class="cover-clear" id="coverClear" style="<?= !empty($editing['cover'])?'display:inline':'' ?>">убрать</span>
        <span class="uploading" id="coverUp"></span>
        <input type="file" id="coverInput" accept="image/*" hidden>
      </div>

      <label>Адрес статьи (можно оставить пустым — создастся сам)</label>
      <input type="text" name="slug" placeholder="генерируется автоматически из заголовка" value="<?= e($editing['slug'] ?? '') ?>">

      <label>Текст статьи</label>
      <div class="toolbar">
        <button type="button" data-block="h2" title="Заголовок раздела">Заголовок</button>
        <button type="button" data-block="h3" title="Подзаголовок">Подзаголовок</button>
        <button type="button" data-block="p" title="Обычный абзац">Абзац</button>
        <span class="tb-sep"></span>
        <button type="button" data-cmd="bold" title="Жирный (Ctrl+B)"><b>Ж</b></button>
        <button type="button" data-cmd="italic" title="Курсив (Ctrl+I)"><i>К</i></button>
        <span class="tb-sep"></span>
        <button type="button" data-cmd="insertUnorderedList" title="Маркированный список">• Список</button>
        <button type="button" data-cmd="insertOrderedList" title="Нумерованный список">1. Список</button>
        <button type="button" data-block="blockquote" title="Цитата">❝ Цитата</button>
        <span class="tb-sep"></span>
        <button type="button" id="linkBtn" title="Вставить ссылку">🔗 Ссылка</button>
        <button type="button" id="unlinkBtn" title="Убрать ссылку">✕ Ссылка</button>
        <button type="button" id="imgBtn" title="Вставить картинку">🖼 Картинка</button>
        <span class="tb-sep"></span>
        <button type="button" data-cmd="removeFormat" title="Убрать оформление">⌫ Очистить</button>
        <span class="uploading" id="imgUp"></span>
      </div>
      <div class="editor" id="editor" contenteditable="true" data-ph="Пишите или вставляйте текст (Ctrl+V). Форматирование из Word, Google Документов и с сайтов сохранится — заголовки, жирный, списки и ссылки. Оформить вручную можно кнопками сверху."><?= $editing['body'] ?? '' ?></div>
      <div class="hint">Можно вставлять уже оформленный текст — заголовки, списки, жирный и ссылки сохранятся. Картинки — кнопкой «🖼 Картинка» или перетащите файл прямо в поле.</div>

      <label>Частые вопросы (FAQ) — по одному в строке, формат «Вопрос :: Ответ»</label>
      <textarea name="faq" rows="4" placeholder="Сколько стоит внедрение? :: Зависит от объёма документов, считаем на аудите."><?= e($faqText) ?></textarea>
      <div class="hint">FAQ помогает статье попасть в блок ответов Google/Яндекса.</div>

      <button class="btn" type="submit" id="submitBtn"><?= $editing ? 'Сохранить изменения' : 'Опубликовать статью' ?></button>
      <?php if($editing) echo ' <a href="admin.php" style="margin-left:12px;color:#8492AE;font-size:14px">Отмена</a>'; ?>
    </form>
  </div>
  <div class="card">
    <div class="side-h">Опубликовано (<?= count($posts) ?>)</div>
    <ul class="plist">
      <?php foreach($posts as $p): ?>
      <li>
        <a href="/blog/<?= e($p['slug']) ?>/" target="_blank"><?= e($p['title']) ?></a>
        <div class="row">
          <span style="font-size:12px;color:#8492AE"><?= date('d.m.Y', strtotime($p['date'])) ?></span>
          <span class="acts">
            <a href="?edit=<?= e($p['slug']) ?>">Редактировать</a>
            <a class="del" href="?delete=<?= e($p['slug']) ?>" onclick="return confirm('Удалить статью?')">Удалить</a>
          </span>
        </div>
      </li>
      <?php endforeach; ?>
      <?php if(!$posts) echo '<li style="color:#8492AE;font-size:14px">Пока пусто. Создайте первую статью.</li>'; ?>
    </ul>
  </div>
</div>
<script>
var editor=document.getElementById('editor');
try{ document.execCommand('defaultParagraphSeparator', false, 'p'); }catch(e){}

// ---- Разрешённые теги. Всё остальное при вставке/сохранении вычищается ----
var ALLOWED={ 'P':[], 'BR':[], 'H2':[], 'H3':[], 'STRONG':[], 'EM':[],
  'UL':[], 'OL':[], 'LI':[], 'BLOCKQUOTE':[], 'A':['href'], 'IMG':['src','alt'] };
// во что превращаем «синонимы» тегов
var MAP={ 'B':'STRONG','I':'EM','H1':'H2','H4':'H3','H5':'H3','H6':'H3','DIV':'P' };

// Жирный/курсив могут быть заданы стилем (Google Документы: font-weight:700),
// а не тегом. Распознаём и то, и другое.
function emphasisOf(el){
  var b=false,i=false, st=((el.getAttribute&&el.getAttribute('style'))||'').toLowerCase();
  if(/font-weight\s*:\s*(bold|[6-9]00)/.test(st)) b=true;
  if(/font-style\s*:\s*italic/.test(st)) i=true;
  var t=el.nodeName.toUpperCase();
  if(t==='B'||t==='STRONG') b=true;
  if(t==='I'||t==='EM') i=true;
  return {b:b,i:i};
}

// Рекурсивно чистим узел, оставляя только разрешённые теги и атрибуты.
function cleanNode(node, out){
  node.childNodes.forEach(function(ch){
    if(ch.nodeType===3){ // текст
      out.appendChild(document.createTextNode(ch.nodeValue));
      return;
    }
    if(ch.nodeType!==1) return;
    var tag=ch.nodeName.toUpperCase();
    if(MAP[tag]) tag=MAP[tag];
    if(tag==='SCRIPT'||tag==='STYLE') return;
    if(ALLOWED[tag] && tag!=='STRONG' && tag!=='EM'){
      var el=document.createElement(tag);
      (ALLOWED[tag]||[]).forEach(function(attr){
        var v=ch.getAttribute&&ch.getAttribute(attr);
        if(v){
          if(attr==='href'&&/^\s*javascript:/i.test(v)) return;
          el.setAttribute(attr, v);
        }
      });
      if(tag==='A'){ el.setAttribute('target','_blank'); el.setAttribute('rel','noopener'); }
      cleanNode(ch, el);
      // пустые ссылки/заголовки/абзацы без текста и без картинок выкидываем
      if(tag!=='BR'&&tag!=='IMG'&&!el.textContent.trim()&&!el.querySelector('img')) return;
      out.appendChild(el);
    } else {
      // span/font/strong/em/b/i — переносим только жирность и курсив, тег отбрасываем
      var emp=emphasisOf(ch), target=out;
      if(emp.b){ var s=document.createElement('strong'); out.appendChild(s); target=s; }
      if(emp.i){ var em=document.createElement('em'); target.appendChild(em); target=em; }
      cleanNode(ch, target);
    }
  });
}

// Из грязного HTML делаем чистый. blockLevel=true — оборачиваем «голый» текст в <p>.
function sanitize(dirtyHtml){
  var tmp=document.createElement('div'); tmp.innerHTML=dirtyHtml;
  var clean=document.createElement('div');
  cleanNode(tmp, clean);
  // строчные куски верхнего уровня (текст, ссылки, жирный без абзаца) собираем в <p>
  var wrap=document.createElement('div'), buf=null;
  var BLOCK={P:1,H2:1,H3:1,UL:1,OL:1,BLOCKQUOTE:1,IMG:1};
  [].slice.call(clean.childNodes).forEach(function(n){
    var isBlock=n.nodeType===1&&BLOCK[n.nodeName];
    if(isBlock){ if(buf){wrap.appendChild(buf);buf=null;} wrap.appendChild(n); }
    else {
      if(n.nodeType===3&&!n.nodeValue.trim()) return;
      if(!buf) buf=document.createElement('p');
      buf.appendChild(n);
    }
  });
  if(buf) wrap.appendChild(buf);
  return wrap.innerHTML;
}

// ---- Панель форматирования ----
function applyBlock(tag){
  editor.focus();
  // formatBlock ждёт <h2>/<p>/<blockquote>
  document.execCommand('formatBlock', false, '<'+tag+'>');
  refreshToolbar();
}
document.querySelectorAll('.toolbar button[data-block]').forEach(function(b){
  b.addEventListener('mousedown', function(e){ e.preventDefault(); });
  b.addEventListener('click', function(){ applyBlock(b.getAttribute('data-block')); });
});
document.querySelectorAll('.toolbar button[data-cmd]').forEach(function(b){
  b.addEventListener('mousedown', function(e){ e.preventDefault(); });
  b.addEventListener('click', function(){
    editor.focus();
    document.execCommand(b.getAttribute('data-cmd'), false, null);
    refreshToolbar();
  });
});

// подсветка активных кнопок
function currentBlock(){
  var n=window.getSelection().anchorNode; if(!n) return '';
  if(n.nodeType===3) n=n.parentNode;
  while(n&&n!==editor){ var t=n.nodeName; if(/^(H2|H3|P|BLOCKQUOTE|LI)$/.test(t)) return t; n=n.parentNode; }
  return '';
}
function refreshToolbar(){
  var blk=currentBlock();
  document.querySelectorAll('.toolbar button[data-block]').forEach(function(b){
    b.classList.toggle('active', b.getAttribute('data-block').toUpperCase()===blk);
  });
  try{
    document.querySelector('[data-cmd=bold]').classList.toggle('active', document.queryCommandState('bold'));
    document.querySelector('[data-cmd=italic]').classList.toggle('active', document.queryCommandState('italic'));
  }catch(e){}
}
document.addEventListener('selectionchange', function(){
  if(document.activeElement===editor) refreshToolbar();
});

// ссылка: если выделен текст — оборачиваем; если нет — спрашиваем и текст, и адрес
document.getElementById('linkBtn').addEventListener('mousedown', function(e){ e.preventDefault(); });
document.getElementById('linkBtn').addEventListener('click', function(){
  editor.focus();
  var sel=window.getSelection();
  var picked=sel && sel.toString().trim();
  var url=prompt('Адрес ссылки (например, https://neirodocs.ru/product/):','https://');
  if(!url||url==='https://') return;
  if(!/^(https?:|mailto:|tel:|\/)/i.test(url)) url='https://'+url;
  if(picked){
    document.execCommand('createLink', false, url);
  } else {
    var text=prompt('Текст ссылки:', url)||url;
    document.execCommand('insertHTML', false,
      '<a href="'+url.replace(/"/g,'%22')+'" target="_blank" rel="noopener">'+
      text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</a>&nbsp;');
  }
});
document.getElementById('unlinkBtn').addEventListener('mousedown', function(e){ e.preventDefault(); });
document.getElementById('unlinkBtn').addEventListener('click', function(){
  editor.focus(); document.execCommand('unlink', false, null);
});

// ---- Умная вставка: СОХРАНЯЕМ форматирование, но чистим мусор ----
editor.addEventListener('paste', function(e){
  e.preventDefault();
  var cb=e.clipboardData||window.clipboardData;
  var html=cb.getData('text/html');
  var out;
  if(html && html.replace(/<[^>]+>/g,'').trim()){
    out=sanitize(html);
  } else {
    // простой текст: пустые строки = новые абзацы, одиночные переносы = <br>
    var text=cb.getData('text/plain')||'';
    var esc=function(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
    out=text.split(/\n\s*\n/).map(function(b){
      return '<p>'+esc(b.trim()).replace(/\n/g,'<br>')+'</p>';
    }).filter(function(x){ return x!=='<p></p>'; }).join('');
  }
  document.execCommand('insertHTML', false, out);
});

// Сжимаем фото в браузере ДО отправки: телефонные снимки по 3–6 МБ превращаются
// в лёгкие JPEG ~200–500 КБ. Так загрузка работает на любом хостинге (не упирается
// в post_max_size) и сайт грузится быстрее. Если что-то пойдёт не так — шлём как есть.
function shrinkImage(file, cb){
  // GIF не трогаем (может быть анимация); мелкие файлы тоже не пережимаем.
  if(!/^image\//.test(file.type) || file.type==='image/gif' || file.size < 400*1024){ cb(file); return; }
  var url=URL.createObjectURL(file);
  var img=new Image();
  img.onload=function(){
    try{
      var MAX=1600;
      var w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
      var scale=Math.min(1, MAX/Math.max(w,h));
      var cw=Math.round(w*scale), ch=Math.round(h*scale);
      var cv=document.createElement('canvas'); cv.width=cw; cv.height=ch;
      cv.getContext('2d').drawImage(img,0,0,cw,ch);
      URL.revokeObjectURL(url);
      cv.toBlob(function(blob){
        if(blob && blob.size < file.size){ blob.name='photo.jpg'; cb(blob); }
        else cb(file);
      }, 'image/jpeg', 0.82);
    }catch(e){ URL.revokeObjectURL(url); cb(file); }
  };
  img.onerror=function(){ URL.revokeObjectURL(url); cb(file); };
  img.src=url;
}

// загрузка картинки в текст
function uploadImage(file, onDone, statusEl){
  if(!file) return;
  if(statusEl) statusEl.textContent='Сжимаем…';
  shrinkImage(file, function(payload){
    if(statusEl) statusEl.textContent='Загрузка…';
    var fd=new FormData();
    fd.append('image', payload, (payload && payload.name) ? payload.name : (file.name||'photo.jpg'));
    fetch('/blog/upload.php',{method:'POST',body:fd})
      .then(function(r){ return r.json().catch(function(){ return {ok:false,error:'сервер вернул не JSON (код '+r.status+')'}; }); })
      .then(function(j){
        if(statusEl) statusEl.textContent='';
        if(j && j.ok && j.url){ onDone(j.url); }
        else { alert('Не удалось загрузить: '+((j&&j.error)||'ошибка')); }
      })
      .catch(function(){ if(statusEl) statusEl.textContent=''; alert('Ошибка загрузки картинки. Проверьте, что вы вошли в админку.'); });
  });
}

var imgInput=document.createElement('input'); imgInput.type='file'; imgInput.accept='image/*'; imgInput.hidden=true; document.body.appendChild(imgInput);
document.getElementById('imgBtn').addEventListener('click', function(){ editor.focus(); imgInput.click(); });
imgInput.addEventListener('change', function(){
  var f=imgInput.files[0]; imgInput.value='';
  uploadImage(f, function(url){
    editor.focus();
    document.execCommand('insertHTML', false, '<img src="'+url+'" alt=""><p></p>');
  }, document.getElementById('imgUp'));
});

// перетаскивание картинки прямо в поле
editor.addEventListener('dragover', function(e){ e.preventDefault(); editor.style.borderColor='#1D5DE3'; });
editor.addEventListener('dragleave', function(){ editor.style.borderColor=''; });
editor.addEventListener('drop', function(e){
  e.preventDefault(); editor.style.borderColor='';
  var f=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
  if(f&&/^image\//.test(f.type)){
    uploadImage(f, function(url){
      editor.focus();
      document.execCommand('insertHTML', false, '<img src="'+url+'" alt=""><p></p>');
    }, document.getElementById('imgUp'));
  }
});

// обложка
var coverInput=document.getElementById('coverInput'), coverField=document.getElementById('coverField'),
    coverPreview=document.getElementById('coverPreview'), coverClear=document.getElementById('coverClear');
document.getElementById('coverBtn').addEventListener('click', function(){ coverInput.click(); });
coverInput.addEventListener('change', function(){
  var f=coverInput.files[0]; coverInput.value='';
  uploadImage(f, function(url){
    coverField.value=url; coverPreview.src=url; coverPreview.classList.add('show');
    coverClear.style.display='inline';
  }, document.getElementById('coverUp'));
});
coverClear.addEventListener('click', function(){
  coverField.value=''; coverPreview.src=''; coverPreview.classList.remove('show'); coverClear.style.display='none';
});

// перед отправкой — прогоняем содержимое через тот же санитайзер (чистый HTML)
document.getElementById('postForm').addEventListener('submit', function(e){
  var html=sanitize(editor.innerHTML)
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi,'')  // пустые абзацы
    .replace(/&nbsp;/g,' ')
    .trim();
  if(!html || !editor.textContent.trim()){
    e.preventDefault(); alert('Напишите текст статьи.'); editor.focus(); return;
  }
  document.getElementById('bodyField').value=html;
});
</script>
</body></html>
