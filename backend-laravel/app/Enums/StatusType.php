<?php

namespace App\Enums;

enum StatusType: string
{
    case DRAFT = 'draft';
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case INACTIVE = 'inactive';
    case SUSPENDED = 'suspended';
}
