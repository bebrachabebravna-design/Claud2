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
        $faq = [];
        foreach (preg_split('/\r?\n/', $_POST['faq'] ?? '') as $line) {
            if (strpos($line, '::') !== false) { [$q,$a] = array_map('trim', explode('::', $line, 2)); if($q&&$a) $faq[] = ['q'=>$q,'a'=>$a]; }
        }
        $cover = trim($_POST['cover'] ?? '');
        $orig = $_POST['orig_slug'] ?? '';
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
.toolbar{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0;padding:8px;background:#F4F7FD;border:1px solid #D8DEEA;border-bottom:none;border-radius:10px 10px 0 0}
.toolbar button{background:#fff;border:1px solid #D8DEEA;border-radius:8px;padding:7px 12px;font-size:13px;cursor:pointer;font-weight:600;color:#1F2A47}
.toolbar button:hover{background:#E0EAFF;border-color:var(--acc);color:var(--acc)}
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
        <button type="button" data-cmd="formatBlock" data-val="h2">Заголовок</button>
        <button type="button" data-cmd="formatBlock" data-val="h3">Подзаголовок</button>
        <button type="button" data-cmd="formatBlock" data-val="p">Обычный текст</button>
        <button type="button" data-cmd="bold">Жирный</button>
        <button type="button" data-cmd="insertUnorderedList">Список</button>
        <button type="button" data-cmd="formatBlock" data-val="blockquote">Цитата</button>
        <button type="button" id="linkBtn">Ссылка</button>
        <button type="button" id="imgBtn">🖼 Картинка</button>
        <span class="uploading" id="imgUp"></span>
      </div>
      <div class="editor" id="editor" contenteditable="true" data-ph="Просто вставьте сюда текст статьи (Ctrl+V) — он сам разобьётся на абзацы. Выделяйте текст и жмите кнопки сверху, чтобы сделать заголовок, список или вставить картинку."><?= $editing['body'] ?? '' ?></div>
      <div class="hint">Вставляйте текст как есть — оформление можно навести кнопками. Картинки грузятся кнопкой «🖼 Картинка».</div>

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

// формат-кнопки
document.querySelectorAll('.toolbar button[data-cmd]').forEach(function(b){
  b.addEventListener('click', function(){
    editor.focus();
    var cmd=b.getAttribute('data-cmd'), val=b.getAttribute('data-val');
    if(cmd==='formatBlock'){ document.execCommand('formatBlock', false, val); }
    else { document.execCommand(cmd, false, null); }
  });
});

// ссылка
document.getElementById('linkBtn').addEventListener('click', function(){
  editor.focus();
  var url=prompt('Вставьте адрес ссылки (например, https://neirodocs.ru/product/):','https://');
  if(url && url!=='https://'){ document.execCommand('createLink', false, url); }
});

// вставка plain-текста -> чистые абзацы (чтобы из Word не тянуло мусор)
editor.addEventListener('paste', function(e){
  e.preventDefault();
  var text=(e.clipboardData||window.clipboardData).getData('text/plain');
  if(!text) return;
  var blocks=text.split(/\n\s*\n/).map(function(s){ return s.replace(/\n/g,' ').trim(); }).filter(Boolean);
  var html=blocks.map(function(b){ return '<p>'+b.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</p>'; }).join('');
  document.execCommand('insertHTML', false, html);
});

// загрузка картинки в текст
function uploadImage(file, onDone, statusEl){
  if(!file) return;
  if(statusEl) statusEl.textContent='Загрузка…';
  var fd=new FormData(); fd.append('image', file);
  fetch('/blog/upload.php',{method:'POST',body:fd})
    .then(function(r){ return r.json(); })
    .then(function(j){
      if(statusEl) statusEl.textContent='';
      if(j && j.ok && j.url){ onDone(j.url); }
      else { alert('Не удалось загрузить: '+((j&&j.error)||'ошибка')); }
    })
    .catch(function(){ if(statusEl) statusEl.textContent=''; alert('Ошибка загрузки картинки'); });
}

var imgInput=document.createElement('input'); imgInput.type='file'; imgInput.accept='image/*'; imgInput.hidden=true; document.body.appendChild(imgInput);
document.getElementById('imgBtn').addEventListener('click', function(){ editor.focus(); imgInput.click(); });
imgInput.addEventListener('change', function(){
  var f=imgInput.files[0]; imgInput.value='';
  uploadImage(f, function(url){
    editor.focus();
    document.execCommand('insertHTML', false, '<img src="'+url+'" alt="">');
  }, document.getElementById('imgUp'));
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

// перед отправкой — переносим HTML редактора в скрытое поле, чистим div-обёртки
document.getElementById('postForm').addEventListener('submit', function(e){
  var html=editor.innerHTML
    .replace(/<div>/gi,'<p>').replace(/<\/div>/gi,'</p>')
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi,'')
    .replace(/ style="[^"]*"/gi,'')
    .replace(/&nbsp;/g,' ');
  if(!html.trim() || !editor.textContent.trim()){
    e.preventDefault(); alert('Напишите текст статьи.'); editor.focus(); return;
  }
  document.getElementById('bodyField').value=html;
});
</script>
</body></html>
