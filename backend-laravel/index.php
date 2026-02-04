<?php

// =============================================================
// QuickEcom — FINAL (Local Dev CORS Fix, non-breaking)
// Fixes Flutter Web NetworkImage statusCode: 0 for /storage/*
// - Does NOT change app architecture
// - Keeps installer guard and normal Laravel boot
// - Adds CORS headers for allowed local origins
// - Handles OPTIONS quickly
// =============================================================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://sportoonline.com'
];

// CORS headers (only for allowed origins)
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Vary: Origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: *");
    header("Access-Control-Max-Age: 86400");
}

// Preflight: respond immediately
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ------------------------------------------------------------
// If not installed, redirect to installer before doing ANYTHING else
// ------------------------------------------------------------
if (!file_exists(__DIR__ . '/storage/installed')) {
    header("Location: /install");
    exit;
}

// After installation, vendor must exist
require __DIR__ . '/vendor/autoload.php';

// Boot Laravel normally
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->handleRequest(Illuminate\Http\Request::capture());
