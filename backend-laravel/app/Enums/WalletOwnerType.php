<?php

namespace App\Enums;

enum WalletOwnerType: string
{
    case STORE = 'App\Models\Store';
    case DELIVERYMAN = 'App\Models\User';
    case CUSTOMER = 'App\Models\Customer';
}