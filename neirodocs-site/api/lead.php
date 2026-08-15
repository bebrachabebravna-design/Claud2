<?php
// =====================================================================
//  Нейродокс — приём заявок с форм сайта (собственный обработчик)
//
//  Зачем свой, а не FormSubmit: данные остаются на вашем российском
//  хостинге и НЕ уходят третьим лицам и за границу. Это чище всего по
//  152-ФЗ. Каждая заявка:
//    1) сохраняется в api/data/leads.jsonl — не потеряется никогда,
//       даже если письмо уйдёт в спам. Смотреть: /api/leads.php
//    2) отправляется вам на почту (см. LEAD_EMAIL в config.php),
//    3) при желании дублируется в Telegram (если задан бот в config.php).
//
//  Форма шлёт обычный POST (fetch). В ответ — JSON {ok:true}.
// =====================================================================
declare(strict_types=1);
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// значения по умолчанию, если не заданы в config.php
if (!defined('LEAD_EMAIL'))        define('LEAD_EMAIL', 'neirodocs.support@gmail.com');
if (!defined('LEAD_EMAIL_FROM'))   define('LEAD_EMAIL_FROM', 'noreply@neirodocs.ru');
if (!defined('LEAD_TG_TOKEN'))     define('LEAD_TG_TOKEN', '');   // токен бота BotFather
if (!defined('LEAD_TG_CHAT'))      define('LEAD_TG_CHAT', '');    // ваш chat_id
if (!defined('LEAD_IP_LIMIT'))     define('LEAD_IP_LIMIT', 30);   // заявок с одного IP в сутки

function out(array $data): void {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function fail(string $why, int $http = 400): void {
    http_response_code($http);
    out(['ok' => false, 'error' => $why]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Только POST', 405);

// ── Антиспам: honeypot ───────────────────────────────────────────────
// Скрытое поле _honey заполняют только боты — молча отбрасываем как «успех»,
// чтобы бот не понял, что его раскусили.
if (trim((string)($_POST['_honey'] ?? '')) !== '') out(['ok' => true]);

$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0';
$ip = trim(explode(',', $ip)[0]);

// ── Лимит заявок с одного IP в сутки ─────────────────────────────────
$dir = __DIR__ . '/data';
if (!is_dir($dir)) @mkdir($dir, 0755, true);
$limFile = $dir . '/lead_' . date('Ymd') . '_' . preg_replace('/[^a-f0-9.:]/i', '', $ip) . '.cnt';
$count = (int)@file_get_contents($limFile);
if ($count >= LEAD_IP_LIMIT) fail('Слишком много заявок. Попробуйте позже или напишите в Telegram.', 429);
@file_put_contents($limFile, (string)($count + 1));
// уборка вчерашних счётчиков
foreach (glob($dir . '/lead_*.cnt') ?: [] as $f) {
    if (strpos($f, '/lead_' . date('Ymd') . '_') === false) @unlink($f);
}

// ── Разбор полей формы ───────────────────────────────────────────────
// Берём любые присланные поля, кроме служебных. Значения обрезаем и чистим
// от переводов строк, чтобы нельзя было подделать заголовки письма.
$service = ['_honey', 'form', 'action', 'Страница'];
$fields = [];
foreach ($_POST as $k => $v) {
    if (in_array($k, $service, true)) continue;
    if (!is_string($v)) continue;
    $k = trim(mb_substr($k, 0, 60));
    $v = trim(mb_substr(preg_replace('/[\r\n]+/', ' ', $v), 0, 2000));
    if ($k !== '' && $v !== '') $fields[$k] = $v;
}

// хотя бы один контакт должен быть
$contact = $fields['Контакт'] ?? $fields['Телефон'] ?? $fields['Email'] ?? '';
if ($contact === '' && count($fields) === 0) fail('Пустая заявка');

$formName = trim((string)($_POST['form'] ?? 'Заявка с сайта'));
$page     = trim((string)($_POST['Страница'] ?? ($_SERVER['HTTP_REFERER'] ?? '')));
$now      = date('Y-m-d H:i:s');

// ── 1. Сохраняем в файл (главное — заявка не потеряется) ─────────────
$record = [
    'time'    => $now,
    'form'    => $formName,
    'fields'  => $fields,
    'page'    => $page,
    'ip'      => $ip,
    'ua'      => mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 300),
];
$line = json_encode($record, JSON_UNESCAPED_UNICODE) . "\n";
$lf = @fopen($dir . '/leads.jsonl', 'a');
if ($lf) { @flock($lf, LOCK_EX); @fwrite($lf, $line); @flock($lf, LOCK_UN); @fclose($lf); }

// ── 2. Письмо владельцу ──────────────────────────────────────────────
$linesTxt = [];
foreach ($fields as $k => $v) $linesTxt[] = $k . ': ' . $v;
$body = "Новая заявка с сайта Нейродокс\n"
      . "Форма: {$formName}\n"
      . "Время: {$now}\n"
      . ($page ? "Страница: {$page}\n" : '')
      . "\n" . implode("\n", $linesTxt) . "\n";

$subject = '=?UTF-8?B?' . base64_encode('Заявка с сайта: ' . $formName) . '?=';
$headers = [
    'From: Нейродокс <' . LEAD_EMAIL_FROM . '>',
    'Reply-To: ' . (preg_match('/^\S+@\S+\.\S+$/', $contact) ? $contact : LEAD_EMAIL_FROM),
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: neirodocs',
];
$mailOk = @mail(LEAD_EMAIL, $subject, $body, implode("\r\n", $headers));

// ── 3. Telegram (если настроен) ──────────────────────────────────────
if (LEAD_TG_TOKEN !== '' && LEAD_TG_CHAT !== '' && function_exists('curl_init')) {
    $tg = "🔔 <b>Заявка с сайта</b>\n<b>{$formName}</b>\n\n";
    foreach ($fields as $k => $v) $tg .= htmlspecialchars($k) . ': ' . htmlspecialchars($v) . "\n";
    if ($page) $tg .= "\n" . htmlspecialchars($page);
    $ch = curl_init('https://api.telegram.org/bot' . LEAD_TG_TOKEN . '/sendMessage');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query(['chat_id' => LEAD_TG_CHAT, 'text' => $tg, 'parse_mode' => 'HTML']),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
    ]);
    @curl_exec($ch);
    @curl_close($ch);
}

// Заявка сохранена в файле в любом случае — считаем успехом.
out(['ok' => true, 'mail' => $mailOk]);
