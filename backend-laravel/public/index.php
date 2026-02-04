<?php

// If not installed, redirect to installer before doing ANYTHING else
if (!file_exists(__DIR__ . '/../storage/installed')) {
    header("Location: /install");
    exit;
}


// After installation, vendor must exist
require __DIR__ . '/../vendor/autoload.php';

// Boot Laravel normally
$app = require_once __DIR__ . '/../bootstrap/app.php';

$app->handleRequest(Illuminate\Http\Request::capture());
