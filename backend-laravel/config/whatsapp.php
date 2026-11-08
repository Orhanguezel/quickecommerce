<?php

return [
    'enabled' => (bool) env('WHATSAPP_ENABLED', false),
    'graph_version' => env('WHATSAPP_GRAPH_VERSION', 'v23.0'),
    'callback_url' => env('WHATSAPP_CALLBACK_URL', rtrim(env('APP_URL', ''), '/').'/api/v1/webhooks/whatsapp'),
    'queue' => 'whatsapp',
    'http_timeout' => 15,
    'health_ttl_minutes' => 15,
    'template_ttl_minutes' => 60,
    'retention_days' => (int) env('WHATSAPP_CONTENT_RETENTION_DAYS', 90),
    'events' => [
        'payment_confirmed' => ['template' => 'sportoonline_payment_confirmed_v1', 'parameters' => 3, 'ttl_hours' => 24],
        'cod_order_accepted' => ['template' => 'sportoonline_cod_order_received_v1', 'parameters' => 3, 'ttl_hours' => 24],
        'shipment_dispatched' => ['template' => 'sportoonline_shipment_dispatched_v1', 'parameters' => 4, 'ttl_hours' => 12],
        'shipment_delivered' => ['template' => 'sportoonline_shipment_delivered_v1', 'parameters' => 2, 'ttl_hours' => 24],
        'order_cancelled' => ['template' => 'sportoonline_order_cancelled_v1', 'parameters' => 2, 'ttl_hours' => 24],
        'refund_confirmed' => ['template' => 'sportoonline_refund_confirmed_v1', 'parameters' => 2, 'ttl_hours' => 72],
    ],
];
