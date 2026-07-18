<?php
// Персональные рекомендации для отчёта калькулятора потерь.
// Принимает цифры калькулятора и сферу компании, спрашивает нейросеть через
// Polza.ai (OpenAI-совместимый API) и возвращает простые, понятные новичку
// советы: где теряются деньги, как команде начать пользоваться обычными
// нейросетями и готовые запросы под его сферу. Ключ хранится на сервере.
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

ВАЖНО ПРО ЧИТАТЕЛЯ: это собственник или руководитель компании, он НЕ разбирается в нейросетях
и сначала будет пробовать ОБЫЧНЫЕ нейросети сам, а не ИИ-агента. Помоги ему в этом честно.
Слова «промпт», «LLM», «токены» ему непонятны — пиши «запрос для нейросети», «ИИ».
Пиши просто, коротко, по-деловому, без воды.

Доступные ему нейросети (используй эти пометки в советах):
- GigaChat (giga.chat) и Алиса/YandexGPT (alice.yandex.ru) — российские, без VPN, безопаснее для рабочих
  документов с реквизитами и персональными данными;
- Claude (claude.ai) — открывается через VPN, лучший для генерации документов по шаблону и разбора больших договоров;
- ChatGPT (chatgpt.com) — открывается через VPN, универсальный.
Правило безопасности: документы с реквизитами и персональными данными — только в российские нейросети,
либо удалять реквизиты перед вставкой в зарубежные.

Отвечай СТРОГО валидным JSON без markdown, по-русски:
{"pains":[{"title":"...","text":"..."}],
 "how_to":["..."],
 "templates":[{"title":"...","where":"...","prompt":"..."}],
 "reduction":"..."}

pains — ровно 3 пункта: где именно в ЕГО сфере утекают деньги и время из-за документов
(штрафы, простои, потерянные клиенты) и что с этим делать. Конкретика по сфере, 1-2 предложения.

how_to — ровно 4 шага: понятный план «как вашей команде начать пользоваться обычными нейросетями
на этой неделе», С УЧЁТОМ РАЗМЕРА КОМАНДЫ (кому поручить, с какого отдела начать, как собрать
частые вопросы). Каждый шаг — 1-2 предложения, выполнимо за день.

templates — ровно 3 готовых запроса для нейросети под ЕГО сферу:
1) один обязательно про ГЕНЕРАЦИЮ ДОКУМЕНТА ПО ШАБЛОНУ его сферы — советуй Claude (пометь «через VPN»),
   безопасный вариант — GigaChat;
2) один про проверку/выжимку важного документа его сферы;
3) один про быстрый ответ клиенту или сотруднику по правилам компании — советуй российские нейросети.
В поле where — куда вставлять запрос и почему именно туда, простыми словами, с пометкой про VPN или
«без VPN, безопасно для рабочих данных». В prompt — полный текст запроса с местами [вставьте ваш документ]
и короткой инструкцией внутри, что подставить.

reduction — 1 предложение: такие ручные приёмы вернут 10-15% потерь, ИИ-агент по всем документам — до 90%.

Не выдумывай факты о компании. Не упоминай конкурентов и цены. Не используй сложные термины.
TXT;

$user = "Сфера компании: {$sphere}. Сотрудников, которые ищут информацию: {$N}. " .
    "Обращений за информацией в день на человека: {$S}. Минут на один поиск: {$M}. " .
    "Ставка: {$H} ₽/час. Потери: {$fmt($lossMo)}/мес. Возврат с ИИ-агентом: до {$fmt($recover)}/мес.";

$models = array_merge([POLZA_MODEL],
    defined('POLZA_MODELS_FALLBACK') ? array_filter(array_map('trim', explode(',', POLZA_MODELS_FALLBACK))) : []);

$out = null;
foreach ($models as $model) {
    $payload = json_encode([
        'model' => $model,
        'messages' => [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ],
        'temperature' => 0.4,
        'max_tokens' => 1600,
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
    if ($resp === false || $code >= 400) continue;

    $data = json_decode($resp, true);
    $text = $data['choices'][0]['message']['content'] ?? '';
    if (!is_string($text) || $text === '') continue;
    // модель могла добавить пояснения вокруг JSON — вырезаем от первой { до последней }
    $s = strpos($text, '{');
    $e = strrpos($text, '}');
    if ($s === false || $e === false || $e <= $s) continue;
    $cand = json_decode(substr($text, $s, $e - $s + 1), true);
    if (is_array($cand) && !empty($cand['pains']) && !empty($cand['templates'])) {
        $out = $cand;
        break;
    }
}
if ($out === null) fail('upstream');

echo json_encode(['ok' => true, 'data' => $out], JSON_UNESCAPED_UNICODE);
