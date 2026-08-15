<?php
// =====================================================================
//  ПРИМЕР config.php — скопируйте в api/config.php и впишите свои значения.
//  Настоящий api/config.php НЕ хранится в репозитории (в нём секретный ключ).
//  Если этих строк в вашем config.php нет — приём заявок всё равно работает
//  со значениями по умолчанию (см. api/lead.php).
// =====================================================================

// ── Нейросеть для отчёта калькулятора (Polza.ai) ─────────────────────
define('POLZA_API_KEY', 'pza_ВАШ_КЛЮЧ');
define('POLZA_BASE', 'https://api.polza.ai/api/v1');
define('POLZA_MODEL', 'anthropic/claude-haiku-4.5');
define('POLZA_MODELS_FALLBACK', 'anthropic/claude-3.5-haiku,openai/gpt-4o-mini');
define('REPORT_IP_LIMIT', 40);

// ── Приём заявок с форм сайта (api/lead.php) ─────────────────────────
// Куда слать письма о заявках. Заявки также сохраняются в файл
// api/data/leads.jsonl и видны на /api/leads.php.
define('LEAD_EMAIL', 'neirodocs.support@gmail.com');
// От кого письмо. Лучше ящик на вашем домене — реже попадает в спам.
define('LEAD_EMAIL_FROM', 'noreply@neirodocs.ru');
// (необязательно) Дублировать заявки в Telegram:
//   1) @BotFather → /newbot → токен → впишите в LEAD_TG_TOKEN;
//   2) напишите боту любое сообщение;
//   3) https://api.telegram.org/bot<ТОКЕН>/getUpdates → "chat":{"id":...} → LEAD_TG_CHAT.
define('LEAD_TG_TOKEN', '');
define('LEAD_TG_CHAT', '');
define('LEAD_IP_LIMIT', 30);
