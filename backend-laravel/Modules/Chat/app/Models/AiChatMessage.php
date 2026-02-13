<?php

namespace Modules\Chat\app\Models;

use Illuminate\Database\Eloquent\Model;

class AiChatMessage extends Model
{
    protected $table = 'ai_chat_messages';

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'tokens_used',
        'provider',
    ];

    public function conversation()
    {
        return $this->belongsTo(AiChatConversation::class, 'conversation_id');
    }
}
