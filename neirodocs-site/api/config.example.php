<?php
// Скопируйте этот файл в config.php и вставьте свой ключ Polza.ai (polza.ai → кабинет → API-ключи)
define('POLZA_API_KEY', 'pza_ВАШ_КЛЮЧ');
define('POLZA_BASE', 'https://api.polza.ai/api/v1');
define('POLZA_MODEL', 'anthropic/claude-haiku-4.5');
define('POLZA_MODELS_FALLBACK', 'anthropic/claude-3.5-haiku,openai/gpt-4o-mini');
define('REPORT_IP_LIMIT', 8);
