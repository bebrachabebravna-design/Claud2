<?php
// =====================================================================
//  Нейродокс — просмотр заявок с сайта (только для владельца)
//  Открыть: https://neirodocs.ru/api/leads.php
//  Вход — тот же пароль, что и в редакторе блога (/blog/admin.php).
//
//  Все заявки лежат в api/data/leads.jsonl. Даже если письмо ушло в спам,
//  здесь заявка будет. Можно скачать всё в CSV.
// =====================================================================
declare(strict_types=1);
require __DIR__ . '/../blog/config.php';
session_name(SESSION_NAME);
session_start();

if (empty($_SESSION['ndx_ok'])) {
    header('Content-Type: text/html; charset=UTF-8');
    exit('<meta charset="UTF-8"><p style="font:16px system-ui;padding:40px">Сначала войдите в <a href="/blog/admin.php">редактор блога</a>, затем вернитесь сюда.</p>');
}

$file = __DIR__ . '/data/leads.jsonl';
$rows = [];
if (is_file($file)) {
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $l) {
        $r = json_decode($l, true);
        if (is_array($r)) $rows[] = $r;
    }
}
$rows = array_reverse($rows); // свежие сверху

// ── Экспорт в CSV ────────────────────────────────────────────────────
if (($_GET['csv'] ?? '') === '1') {
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="leads.csv"');
    $keys = [];
    foreach ($rows as $r) foreach (($r['fields'] ?? []) as $k => $v) $keys[$k] = true;
    $keys = array_keys($keys);
    echo "\xEF\xBB\xBF"; // BOM, чтобы Excel открыл кириллицу
    $out = fopen('php://output', 'w');
    fputcsv($out, array_merge(['Время', 'Форма'], $keys, ['Страница']));
    foreach ($rows as $r) {
        $line = [$r['time'] ?? '', $r['form'] ?? ''];
        foreach ($keys as $k) $line[] = $r['fields'][$k] ?? '';
        $line[] = $r['page'] ?? '';
        fputcsv($out, $line);
    }
    fclose($out);
    exit;
}

function e2(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }
header('Content-Type: text/html; charset=UTF-8');
?><!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Заявки с сайта — Нейродокс</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#F1F4FA;color:#0A1428}
.top{background:#0A1428;color:#fff;padding:14px 24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
.top b{font-weight:700}.top a{color:#9DB2DA;text-decoration:none;font-size:14px;margin-left:16px}
.wrap{max-width:960px;margin:24px auto;padding:0 20px}
.bar{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px}
.count{font-size:15px;color:#4B5876}
.csv{background:linear-gradient(135deg,#1D5DE3,#5B8AFF);color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px}
.lead{background:#fff;border:1px solid #E4E8F0;border-radius:14px;padding:18px 20px;margin-bottom:14px;box-shadow:0 8px 24px -18px rgba(10,20,40,.25)}
.lead-h{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #EEF1F7}
.lead-form{font-weight:700;font-size:15px}
.lead-time{color:#8492AE;font-size:13px}
.f{display:flex;gap:10px;padding:4px 0;font-size:14px}
.f b{min-width:130px;color:#4B5876;font-weight:600}
.f span{color:#0A1428;word-break:break-word}
.lead-page{margin-top:10px;font-size:12px;color:#8492AE;word-break:break-all}
.empty{background:#fff;border:1px dashed #C7D0E0;border-radius:14px;padding:44px;text-align:center;color:#8492AE}
</style></head><body>
<div class="top"><b>📥 Заявки с сайта Нейродокс</b><div><a href="/blog/admin.php">Редактор блога</a><a href="/blog/admin.php?logout=1">Выйти</a></div></div>
<div class="wrap">
  <div class="bar">
    <div class="count">Всего заявок: <b><?= count($rows) ?></b></div>
    <?php if ($rows): ?><a class="csv" href="?csv=1">Скачать в Excel (CSV)</a><?php endif; ?>
  </div>
  <?php if (!$rows): ?>
    <div class="empty">Пока заявок нет.<br>Как только кто-то заполнит форму на сайте — она появится здесь и придёт вам на почту.</div>
  <?php else: foreach ($rows as $r): ?>
    <div class="lead">
      <div class="lead-h">
        <span class="lead-form"><?= e2($r['form'] ?? 'Заявка') ?></span>
        <span class="lead-time"><?= e2($r['time'] ?? '') ?></span>
      </div>
      <?php foreach (($r['fields'] ?? []) as $k => $v): ?>
        <div class="f"><b><?= e2((string)$k) ?></b><span><?= e2((string)$v) ?></span></div>
      <?php endforeach; ?>
      <?php if (!empty($r['page'])): ?><div class="lead-page"><?= e2($r['page']) ?></div><?php endif; ?>
    </div>
  <?php endforeach; endif; ?>
</div></body></html>
