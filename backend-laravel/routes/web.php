<?php

use App\Http\Controllers\Api\V1\ProductFeedController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Product Feeds — fiyat karsilastirma siteleri (Cimri, Akakce vs.)
Route::get('/feeds/cimri.xml', [ProductFeedController::class, 'cimri']);
Route::get('/feeds/google.xml', [ProductFeedController::class, 'google']);
