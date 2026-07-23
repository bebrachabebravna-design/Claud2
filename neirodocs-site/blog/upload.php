<?php
// Загрузка изображений для статей блога. Только для авторизованного владельца.
require __DIR__ . '/config.php';
require __DIR__ . '/lib.php';
session_name(SESSION_NAME);
session_start();

header('Content-Type: application/json; charset=utf-8');

function ufail(string $why): void {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => $why], JSON_UNESCAPED_UNICODE);
    exit;
}

if (empty($_SESSION['ndx_ok'])) ufail('Не авторизованы');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') ufail('Только POST');
if (empty($_FILES['image']) || ($_FILES['image']['error'] ?? 1) !== UPLOAD_ERR_OK) ufail('Файл не получен');

$f = $_FILES['image'];
if ($f['size'] > 8 * 1024 * 1024) ufail('Файл больше 8 МБ');

// Определяем реальный тип по содержимому, а не по имени
$info = @getimagesize($f['tmp_name']);
$allowed = [
    IMAGETYPE_JPEG => 'jpg',
    IMAGETYPE_PNG  => 'png',
    IMAGETYPE_WEBP => 'webp',
    IMAGETYPE_GIF  => 'gif',
];
if ($info === false || !isset($allowed[$info[2]])) ufail('Только изображения (JPG, PNG, WEBP, GIF)');
$ext = $allowed[$info[2]];

$dir = __DIR__ . '/uploads';
if (!is_dir($dir)) @mkdir($dir, 0755, true);

$name = date('Ymd') . '-' . bin2hex(random_bytes(5)) . '.' . $ext;
$dest = $dir . '/' . $name;
if (!move_uploaded_file($f['tmp_name'], $dest)) ufail('Не удалось сохранить файл');
@chmod($dest, 0644);

echo json_encode(['ok' => true, 'url' => '/blog/uploads/' . $name], JSON_UNESCAPED_UNICODE);
