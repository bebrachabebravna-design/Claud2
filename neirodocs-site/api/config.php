<?php
// Ключ Polza.ai для генерации персональных рекомендаций в отчёте калькулятора.
// ⚠️ Этот файл НЕ должен попадать в публичные репозитории.
// Ключ можно перевыпустить в кабинете polza.ai, если понадобится.
define('POLZA_API_KEY', 'pza_iOEjjuDpfCJZL1tKr-RFW62sF5oUsHqa');
define('POLZA_BASE', 'https://api.polza.ai/api/v1');
// Модель: провайдер/модель (см. https://polza.ai/docs). Claude Haiku — быстрый и отлично пишет по-русски.
define('POLZA_MODEL', 'anthropic/claude-haiku-4.5');
// Запасные модели, если основная недоступна у провайдера:
define('POLZA_MODELS_FALLBACK', 'anthropic/claude-3.5-haiku,openai/gpt-4o-mini');
// Лимит запросов к ИИ с одного IP в сутки (защита бюджета от ботов).
define('REPORT_IP_LIMIT', 40);
