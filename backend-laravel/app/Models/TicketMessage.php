<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketMessage extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = [
        'ticket_id',
        'sender_id',
        'receiver_id',
        'sender_role',
        'receiver_role',
        'message',
        'file',
        'is_read',
        'read_at'
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    public function sender()
    {
        return $this->morphTo();
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
    public function getSenderAttribute()
    {
        return match ($this->sender_role) {
            'customer_level' => $this->belongsTo(Customer::class, 'sender_id')->first(),
            'store_level' => $this->belongsTo(Store::class, 'sender_id')->first(),
            default => null,
        };
    }
}
