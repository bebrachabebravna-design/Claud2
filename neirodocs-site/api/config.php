<?php
// Ключ Polza.ai для генерации персональных рекомендаций в отчёте калькулятора.
// ⚠️ Этот файл НЕ должен попадать в публичные репозитории.
// Ключ можно перевыпустить в кабинете polza.ai, если понадобится.
define('POLZA_API_KEY', 'pza_iOEjjuDpfCJZL1tKr-RFW62sF5oUsHqa');
define('POLZA_BASE', 'https://api.polza.ai/api/v1');
// Модель: провайдер/модель (см. https://polza.ai/docs). gpt-4o-mini — быстрая и дешёвая.
define('POLZA_MODEL', 'openai/gpt-4o-mini');
// Лимит запросов к ИИ с одного IP в сутки (защита бюджета от ботов).
define('REPORT_IP_LIMIT', 8);
