<?php

namespace App\Enums;

enum RoleType: string
{
    case SUPER_ADMIN = 'super_admin';
    case STORE_OWNER = 'store_owner';
}
