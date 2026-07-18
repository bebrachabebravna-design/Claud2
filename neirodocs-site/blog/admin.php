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

// ---------- Actions ----------
$msg = '';
$posts = load_posts();
$editing = null;

if (($_POST['action'] ?? '') === 'save') {
    $title = trim($_POST['title'] ?? '');
    $body = trim($_POST['body'] ?? '');
    if ($title && $body) {
        $slug = trim($_POST['slug'] ?? '') ?: slugify($title);
        // faq parse (lines "Q :: A")
        $faq = [];
        foreach (preg_split('/\r?\n/', $_POST['faq'] ?? '') as $line) {
            if (strpos($line, '::') !== false) { [$q,$a] = array_map('trim', explode('::', $line, 2)); if($q&&$a) $faq[] = ['q'=>$q,'a'=>$a]; }
        }
        $orig = $_POST['orig_slug'] ?? '';
        $now = date('c');
        $found = false;
        foreach ($posts as &$p) {
            if ($p['slug'] === $orig) {
                if ($orig !== $slug && is_dir(BLOG_DIR.'/'.$orig)) { @unlink(BLOG_DIR.'/'.$orig.'/index.html'); @rmdir(BLOG_DIR.'/'.$orig); }
                $p = ['slug'=>$slug,'title'=>$title,'question'=>trim($_POST['question']??''),'excerpt'=>trim($_POST['excerpt']??''),
                      'keywords'=>trim($_POST['keywords']??''),'body'=>$body,'faq'=>$faq,
                      'date'=>$p['date'],'updated'=>$now]; $found = true; break;
            }
        }
        unset($p);
        if (!$found) {
            $posts[] = ['slug'=>$slug,'title'=>$title,'question'=>trim($_POST['question']??''),'excerpt'=>trim($_POST['excerpt']??''),
                        'keywords'=>trim($_POST['keywords']??''),'body'=>$body,'faq'=>$faq,'date'=>$now,'updated'=>$now];
        }
        save_posts($posts);
        rebuild_all();
        $msg = 'Статья опубликована и уже на сайте: /blog/'.$slug.'/';
        $posts = load_posts();
    } else { $msg = 'Заполните заголовок и текст.'; }
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
.top{background:#0A1428;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.top b{font-weight:700}.top a{color:#9DB2DA;text-decoration:none;font-size:14px;margin-left:18px}
.grid{display:grid;grid-template-columns:1fr 340px;gap:24px;max-width:1200px;margin:24px auto;padding:0 24px}
@media(max-width:900px){.grid{grid-template-columns:1fr}}
.card{background:#fff;border:1px solid #E4E8F0;border-radius:16px;padding:24px;box-shadow:0 8px 24px -16px rgba(10,20,40,.2)}
label{display:block;font-size:13px;font-weight:600;color:#4B5876;margin:16px 0 6px}
label:first-child{margin-top:0}
input,textarea{width:100%;padding:11px 13px;border:1px solid #D8DEEA;border-radius:10px;font:inherit;font-size:15px;color:#0A1428;background:#fff}
input:focus,textarea:focus{outline:none;border-color:var(--acc)}
textarea{resize:vertical}
.hint{font-size:12px;color:#8492AE;margin-top:4px}
.btn{background:linear-gradient(135deg,#1D5DE3,#5B8AFF);color:#fff;border:none;padding:13px 22px;border-radius:10px;font-weight:600;font-size:15px;cursor:pointer;margin-top:20px}
.btn-tools{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.btn-tools button{background:#EEF1F7;border:1px solid #D8DEEA;border-radius:8px;padding:6px 11px;font-size:13px;cursor:pointer;font-weight:600;color:#1F2A47}
.btn-tools button:hover{background:#E0EAFF;border-color:var(--acc);color:var(--acc)}
.msg{background:#E0EAFF;border:1px solid var(--acc);color:#0D3CB8;padding:12px 16px;border-radius:10px;margin-bottom:18px;font-size:14px}
.plist{list-style:none;padding:0;margin:0}
.plist li{padding:12px 0;border-bottom:1px solid #EEF1F7}
.plist li:last-child{border:none}
.plist a{color:#0A1428;text-decoration:none;font-weight:600;font-size:14px}
.plist .row{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:6px}
.plist .acts a{font-size:12px;color:var(--acc);margin-right:12px}
.plist .acts a.del{color:#DC4B4B}
.side-h{font-size:14px;font-weight:700;margin:0 0 14px;color:#4B5876}
h2{font-size:18px;margin:0 0 18px}
</style></head>
<body>
<div class="top"><b>✍ Редактор блога Нейродокс</b><div><a href="/blog/" target="_blank">Открыть блог ↗</a><a href="?logout=1">Выйти</a></div></div>
<div class="grid">
  <div class="card">
    <h2><?= $editing ? 'Редактирование статьи' : 'Новая статья' ?></h2>
    <?php if($msg) echo '<div class="msg">'.e($msg).'</div>'; ?>
    <form method="post">
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="orig_slug" value="<?= e($editing['slug'] ?? '') ?>">
      <label>Заголовок статьи (H1)</label>
      <input name="title" required placeholder="Как ИИ-агент отвечает по внутренним документам" value="<?= e($editing['title'] ?? '') ?>">
      <label>Вопрос клиента (по нему статья находится в поиске)</label>
      <input name="question" placeholder="Как автоматизировать поддержку сотрудников?" value="<?= e($editing['question'] ?? '') ?>">
      <div class="hint">Формулируйте как реальный запрос клиента в Google/Яндекс.</div>
      <label>Короткое описание (meta description, до 160 символов)</label>
      <input name="excerpt" maxlength="200" placeholder="1–2 предложения, что внутри статьи" value="<?= e($editing['excerpt'] ?? '') ?>">
      <label>Ключевые слова (через запятую)</label>
      <input name="keywords" placeholder="ии агент, автоматизация поддержки, база знаний" value="<?= e($editing['keywords'] ?? '') ?>">
      <label>Адрес статьи (slug, латиницей — можно оставить пустым)</label>
      <input name="slug" placeholder="генерируется автоматически из заголовка" value="<?= e($editing['slug'] ?? '') ?>">

      <label>Текст статьи</label>
      <div class="btn-tools">
        <button type="button" onclick="wrap('h2')">Заголовок</button>
        <button type="button" onclick="wrap('h3')">Подзаголовок</button>
        <button type="button" onclick="ins('<p></p>')">Абзац</button>
        <button type="button" onclick="wrap('strong')">Жирный</button>
        <button type="button" onclick="ins('<ul>\n  <li></li>\n  <li></li>\n</ul>')">Список</button>
        <button type="button" onclick="ins('<blockquote></blockquote>')">Цитата</button>
        <button type="button" onclick="ins('<a href=\'\'></a>')">Ссылка</button>
      </div>
      <textarea name="body" id="body" rows="18" placeholder="Пишите текст. Для оформления используйте кнопки выше (простой HTML: <p>, <h2>, <ul><li>…)."><?= e($editing['body'] ?? '') ?></textarea>
      <div class="hint">Можно писать обычный текст в &lt;p&gt;…&lt;/p&gt;. Кнопки вставляют оформление.</div>

      <label>Частые вопросы (FAQ) — по одному в строке, формат «Вопрос :: Ответ»</label>
      <textarea name="faq" rows="4" placeholder="Сколько стоит внедрение? :: Зависит от объёма документов, считаем на аудите."><?= e($faqText) ?></textarea>
      <div class="hint">FAQ помогает статье попасть в блок ответов Google/Яндекса.</div>

      <button class="btn" type="submit"><?= $editing ? 'Сохранить изменения' : 'Опубликовать статью' ?></button>
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
var ta=document.getElementById('body');
function ins(t){var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value;ta.value=v.slice(0,s)+t+v.slice(e);ta.focus();ta.selectionStart=ta.selectionEnd=s+t.length;}
function wrap(tag){var s=ta.selectionStart,e=ta.selectionEnd,v=ta.value,sel=v.slice(s,e)||'';var t='<'+tag+'>'+sel+'</'+tag+'>';ta.value=v.slice(0,s)+t+v.slice(e);ta.focus();var pos=s+tag.length+2+sel.length;ta.selectionStart=ta.selectionEnd=pos;}
</script>
</body></html>
