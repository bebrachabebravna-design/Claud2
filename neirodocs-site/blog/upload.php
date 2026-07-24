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

if (empty($_SESSION['ndx_ok'])) ufail('Не авторизованы (войдите в админку заново)');
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') ufail('Только POST');

// Если файл превысил post_max_size хостинга — PHP отдаёт ПУСТЫЕ $_FILES и $_POST.
// Ловим это отдельно, чтобы сказать понятную причину, а не «файл не получен».
if (empty($_FILES['image'])) {
    $post = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    $lim  = trim((string)ini_get('post_max_size'));
    if ($post > 0) ufail('Файл слишком большой для хостинга (лимит post_max_size = ' . $lim . '). Фото уже сжимается в браузере — если ошибка осталась, поднимите лимит в панели хостинга.');
    ufail('Файл не получен');
}

$errCode = $_FILES['image']['error'] ?? UPLOAD_ERR_NO_FILE;
if ($errCode !== UPLOAD_ERR_OK) {
    $map = [
        UPLOAD_ERR_INI_SIZE   => 'Файл больше лимита сервера (upload_max_filesize). Поднимите лимит в панели хостинга.',
        UPLOAD_ERR_FORM_SIZE  => 'Файл больше лимита формы.',
        UPLOAD_ERR_PARTIAL    => 'Файл догрузился не полностью — попробуйте ещё раз.',
        UPLOAD_ERR_NO_FILE    => 'Файл не выбран.',
        UPLOAD_ERR_NO_TMP_DIR => 'На сервере нет папки для временных файлов (обратитесь в поддержку хостинга).',
        UPLOAD_ERR_CANT_WRITE => 'Сервер не смог записать файл на диск.',
    ];
    ufail($map[$errCode] ?? ('Ошибка загрузки (код ' . $errCode . ')'));
}

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
if (!is_dir($dir) || !is_writable($dir)) {
    ufail('Папка /blog/uploads не доступна для записи. В файловом менеджере хостинга создайте папку uploads внутри blog и поставьте ей права 755 (или 775).');
}

$name = date('Ymd') . '-' . bin2hex(random_bytes(5)) . '.' . $ext;
$dest = $dir . '/' . $name;
if (!move_uploaded_file($f['tmp_name'], $dest)) ufail('Не удалось сохранить файл на диск (проверьте права на папку /blog/uploads).');
@chmod($dest, 0644);

echo json_encode(['ok' => true, 'url' => '/blog/uploads/' . $name], JSON_UNESCAPED_UNICODE);
