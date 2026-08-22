<?php

$allowedEmails = array_filter(array_map(
    static fn (string $email): string => strtolower(trim($email)),
    explode(',', (string) env(
        'ADMIN_GOOGLE_ALLOWED_EMAILS',
        'sportoonlinecom@gmail.com,engineserplus@gmail.com'
    ))
));

return [
    'enabled' => env('ADMIN_GOOGLE_LOGIN_ENABLED', true),
    'allowed_emails' => array_values(array_unique($allowedEmails)),
    'target_admin_email' => strtolower((string) env(
        'ADMIN_GOOGLE_TARGET_EMAIL',
        'admin@sportoonline.com'
    )),
    'state_ttl_seconds' => 600,
    'exchange_ttl_seconds' => 60,
];
