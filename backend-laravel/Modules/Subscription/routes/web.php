<?php

use Illuminate\Support\Facades\Route;
use Modules\Subscription\app\Http\Controllers\SubscriptionController;


Route::group([], function () {
    Route::resource('subscription', SubscriptionController::class)->names('subscription');
});
