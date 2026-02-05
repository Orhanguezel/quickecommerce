<?php
// Custom dev server router for `php artisan serve`.
// Adds CORS headers for static assets so Flutter Web (CanvasKit) can load images.

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$publicPath = __DIR__ . '/public' . $uri;

// If the requested file exists in /public, serve it with CORS headers.
if ($uri !== '/' && file_exists($publicPath) && is_file($publicPath)) {
    // CORS headers for static assets only (avoid duplicate headers on API responses)
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: *');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if (function_exists('mime_content_type')) {
        $mime = mime_content_type($publicPath);
        if ($mime) {
            header('Content-Type: ' . $mime);
        }
    }
    readfile($publicPath);
    exit;
}

require_once __DIR__ . '/public/index.php';
