<?php
// =====================================================================
//  Нейродокс — счётчик просмотров статей блога
//  GET  /blog/views.php            → {"ok":true,"views":{"slug":123,...}}
//  POST /blog/views.php  slug=...  → {"ok":true,"count":124}
//
//  Статьи блога — статические HTML-файлы, поэтому счётчик работает
//  отдельным лёгким запросом из браузера. Повторные просмотры одного
//  человека в течение суток не засчитываются (проверка и на клиенте,
//  и на сервере по хэшу IP + User-Agent).
// =====================================================================

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

$DATA = __DIR__ . '/data';
$VIEWS = $DATA . '/views.json';
$SEEN  = $DATA . '/views_seen.json';

if (!is_dir($DATA)) @mkdir($DATA, 0755, true);

function read_json(string $f): array {
    if (!file_exists($f)) return [];
    $j = json_decode((string)file_get_contents($f), true);
    return is_array($j) ? $j : [];
}

/** Атомарная запись: сначала во временный файл, потом переименование. */
function write_json(string $f, array $data): void {
    $tmp = $f . '.' . getmypid() . '.tmp';
    file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE));
    @rename($tmp, $f);
}

/** Список разрешённых slug — считаем только реально существующие статьи. */
function known_slugs(): array {
    $posts = read_json(__DIR__ . '/data/posts.json');
    $out = [];
    foreach ($posts as $p) if (!empty($p['slug'])) $out[$p['slug']] = true;
    return $out;
}

$views = read_json($VIEWS);

// ---------- Чтение счётчиков ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok' => true, 'views' => (object)$views], JSON_UNESCAPED_UNICODE);
    exit;
}

// ---------- Регистрация просмотра ----------
$slug = preg_replace('/[^a-z0-9\-]/', '', (string)($_POST['slug'] ?? ''));
if ($slug === '' || !isset(known_slugs()[$slug])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'unknown slug']);
    exit;
}

// Дедупликация: один посетитель — один просмотр статьи в сутки.
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
$ip = trim(explode(',', $ip)[0]);
$fingerprint = substr(sha1($ip . '|' . ($_SERVER['HTTP_USER_AGENT'] ?? '') . '|' . $slug), 0, 16);
$today = gmdate('Y-m-d');

$fp = @fopen($VIEWS . '.lock', 'c');
if ($fp) @flock($fp, LOCK_EX);

$views = read_json($VIEWS);
$seen  = read_json($SEEN);

// чистим вчерашние отметки, чтобы файл не рос бесконечно
foreach ($seen as $k => $d) if ($d !== $today) unset($seen[$k]);

$counted = false;
if (!isset($seen[$fingerprint])) {
    $views[$slug] = (int)($views[$slug] ?? 0) + 1;
    $seen[$fingerprint] = $today;
    write_json($VIEWS, $views);
    write_json($SEEN, $seen);
    $counted = true;
}

if ($fp) { @flock($fp, LOCK_UN); @fclose($fp); }

echo json_encode([
    'ok' => true,
    'count' => (int)($views[$slug] ?? 0),
    'counted' => $counted,
], JSON_UNESCAPED_UNICODE);
