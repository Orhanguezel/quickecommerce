<?php

namespace Modules\Chat\app\Models;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Model;

class AiChatConversation extends Model
{
    protected $table = 'ai_chat_conversations';

    protected $fillable = [
        'customer_id',
        'session_id',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function messages()
    {
        return $this->hasMany(AiChatMessage::class, 'conversation_id');
    }
}
