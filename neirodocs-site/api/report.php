<?php
// Персональные рекомендации для отчёта калькулятора потерь.
// Принимает цифры калькулятора и сферу компании, спрашивает нейросеть через
// Polza.ai (OpenAI-совместимый API) и возвращает JSON с готовыми сценариями
// и промптами под ситуацию посетителя. Ключ хранится только на сервере.
declare(strict_types=1);
require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function fail(string $why): void {
    echo json_encode(['ok' => false, 'why' => $why], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail('method');

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 4096) fail('input');
$in = json_decode($raw, true);
if (!is_array($in)) fail('json');

// --- Валидация входа ---
$num = static function ($v, int $min, int $max): int {
    $v = (int)$v;
    return max($min, min($max, $v));
};
$N = $num($in['employees'] ?? 0, 1, 10000);
$S = $num($in['requests'] ?? 0, 1, 200);
$M = $num($in['minutes'] ?? 0, 1, 240);
$H = $num($in['rate'] ?? 0, 50, 50000);
$sphere = trim(mb_substr((string)($in['sphere'] ?? ''), 0, 200));
if ($sphere === '') $sphere = 'не указана (обычная компания малого/среднего бизнеса)';

$hoursMo = $N * $S * $M / 60 * 21;
$lossMo = (int)round($hoursMo * $H);
$recover = (int)round($lossMo * 0.9);

// --- Лимит на IP (защита бюджета) ---
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$dir = __DIR__ . '/data';
if (!is_dir($dir)) @mkdir($dir, 0775, true);
$limFile = $dir . '/rate_' . date('Ymd') . '_' . preg_replace('/[^a-f0-9.:]/i', '', $ip) . '.cnt';
$count = is_file($limFile) ? (int)file_get_contents($limFile) : 0;
if ($count >= REPORT_IP_LIMIT) fail('limit');
@file_put_contents($limFile, (string)($count + 1));
// чистка старых счётчиков (лениво, раз в ~100 запросов)
if (random_int(1, 100) === 1) {
    foreach (glob($dir . '/rate_*.cnt') ?: [] as $f) {
        if (strpos($f, date('Ymd')) === false) @unlink($f);
    }
}

// --- Запрос к нейросети ---
$fmt = static fn(int $v): string => number_format($v, 0, ',', ' ') . ' ₽';
$system = <<<TXT
Ты — консультант компании «Нейродокс» (внедряет ИИ-агентов по внутренним документам:
агент отвечает сотрудникам на вопросы по регламентам/договорам за 5 секунд со ссылкой на пункт).
Посетитель сайта посчитал в калькуляторе свои потери на поиске информации.
Дай ему реальную пользу уже сегодня и мягко покажи, что полное решение — агент.
Отвечай СТРОГО валидным JSON без markdown, по-русски, без воды и канцелярита:
{"scenarios":[{"title":"...","text":"..."}],  // ровно 3: где именно в ЕГО сфере теряется больше всего времени на документах и что агент там делает; конкретика по сфере, 1-2 предложения text
 "prompts":[{"title":"...","for":"...","prompt":"..."}],  // ровно 3 готовых промпта для ChatGPT/YandexGPT под документы ЕГО сферы; prompt — полный текст с местами [вставьте ...]; for — какая нейросеть подходит
 "quick_wins":["..."],  // 3 шага, которые снизят потери на 10-15% уже на этой неделе без внедрений
 "reduction":"..."}  // 1 предложение: на сколько % реально снизить потери самостоятельно и на сколько — с агентом
Не выдумывай факты о компании посетителя. Не упоминай конкурентов и цены.
TXT;

$user = "Сфера компании: {$sphere}. Сотрудников, которые ищут информацию: {$N}. " .
    "Обращений за информацией в день на человека: {$S}. Минут на один поиск: {$M}. " .
    "Ставка: {$H} ₽/час. Потери: {$fmt($lossMo)}/мес. Возврат с ИИ-агентом: до {$fmt($recover)}/мес.";

$payload = json_encode([
    'model' => POLZA_MODEL,
    'messages' => [
        ['role' => 'system', 'content' => $system],
        ['role' => 'user', 'content' => $user],
    ],
    'temperature' => 0.4,
    'max_tokens' => 1200,
    'response_format' => ['type' => 'json_object'],
], JSON_UNESCAPED_UNICODE);

$ch = curl_init(POLZA_BASE . '/chat/completions');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . POLZA_API_KEY,
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_CONNECTTIMEOUT => 10,
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
curl_close($ch);
if ($resp === false || $code >= 400) fail('upstream');

$data = json_decode($resp, true);
$text = $data['choices'][0]['message']['content'] ?? '';
if (!is_string($text) || $text === '') fail('empty');
// на случай, если модель обернула ответ в ```json ... ```
$text = trim($text);
$text = preg_replace('/^```(?:json)?\s*|\s*```$/', '', $text);
$out = json_decode($text, true);
if (!is_array($out) || empty($out['scenarios']) || empty($out['prompts'])) fail('parse');

echo json_encode(['ok' => true, 'data' => $out], JSON_UNESCAPED_UNICODE);
