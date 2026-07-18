<?php
// Персональные рекомендации для отчёта калькулятора потерь.
// Принимает цифры калькулятора и сферу компании, спрашивает нейросеть через
// Polza.ai (OpenAI-совместимый API) и возвращает простые, понятные новичку
// советы: где теряются деньги, как команде начать пользоваться ИИ и готовые
// запросы под его сферу. Ключ хранится на сервере.
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
if (random_int(1, 100) === 1) {
    foreach (glob($dir . '/rate_*.cnt') ?: [] as $f) {
        if (strpos($f, date('Ymd')) === false) @unlink($f);
    }
}

// --- Запрос к нейросети ---
$fmt = static fn(int $v): string => number_format($v, 0, ',', ' ') . ' ₽';
$system = <<<TXT
Ты — консультант компании «Нейродокс» (внедряет ИИ-агентов по внутренним документам:
агент отвечает сотрудникам на вопросы по регламентам и договорам за 5 секунд со ссылкой на пункт).
Посетитель сайта посчитал в калькуляторе свои потери на поиске информации по документам.

ВАЖНО ПРО ЧИТАТЕЛЯ: это собственник или руководитель компании, он НЕ разбирается в нейросетях.
Слова «промпт», «LLM», «токены», «модель» ему непонятны — пиши «запрос для нейросети», «ИИ».
Его волнует конкретика: меньше рутины с документами, меньше штрафов, быстрее ответы клиентам,
меньше зависимости от «незаменимых» сотрудников. Пиши просто, коротко, по-деловому, без воды.

Отвечай СТРОГО валидным JSON без markdown, по-русски:
{"pains":[{"title":"...","text":"..."}],
 "how_to":["..."],
 "templates":[{"title":"...","where":"...","prompt":"..."}],
 "reduction":"..."}

pains — ровно 3 пункта: где именно в ЕГО сфере утекают деньги и время из-за документов
(штрафы, простои, потерянные клиенты) и что там делает ИИ-агент. Конкретика по сфере, 1-2 предложения.

how_to — ровно 4 шага: понятный план «как вашей команде начать пользоваться ИИ на этой неделе»,
С УЧЁТОМ РАЗМЕРА КОМАНДЫ (у него столько-то сотрудников — учитывай это: кому поручить,
с какого отдела начать, как собрать частые вопросы). Каждый шаг — 1-2 предложения, выполнимо за день.

templates — ровно 3 готовых запроса для нейросети (Claude, GigaChat или YandexGPT) под ЕГО сферу:
1) один обязательно про ГЕНЕРАЦИЮ ДОКУМЕНТА ПО ШАБЛОНУ (заполнить типовой документ его сферы данными);
2) один про проверку/выжимку важного документа его сферы;
3) один про быстрый ответ клиенту или сотруднику по правилам компании.
В поле where напиши, куда вставлять запрос, простыми словами (например: «Claude — claude.ai, вставьте
текст запроса и свой документ»). В prompt — полный текст запроса с местами [вставьте ваш документ].

reduction — 1 предложение: такие ручные приёмы вернут 10-15% потерь, ИИ-агент по всем документам — до 90%.

Не выдумывай факты о компании. Не упоминай конкурентов и цены. Не используй сложные термины.
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
    'max_tokens' => 1400,
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
$text = trim($text);
$text = preg_replace('/^```(?:json)?\s*|\s*```$/', '', $text);
$out = json_decode($text, true);
if (!is_array($out) || empty($out['pains']) || empty($out['templates'])) fail('parse');

echo json_encode(['ok' => true, 'data' => $out], JSON_UNESCAPED_UNICODE);
