<?php

namespace App\Services;

use App\Models\ProductQuery;
use App\Models\Review;
use App\Models\UniversalNotification;
use App\Models\User;

class FeedbackNotificationService
{
    /** Shared admin inbox, matching order notifications. No external delivery. */
    public function notify(ProductQuery|Review $feedback): void
    {
        $adminId = User::where('activity_scope', 'system_level')->orderBy('id')->value('id');
        if (!$adminId) {
            return;
        }

        $question = $feedback instanceof ProductQuery;
        UniversalNotification::create([
            'notifiable_id' => $adminId,
            'notifiable_type' => 'admin',
            'status' => 'unread',
            'title' => $question ? 'Yeni ürün sorusu' : 'Yeni müşteri yorumu',
            'message' => $question
                ? "Soru #{$feedback->id} yanıt bekliyor. Sorular sayfasından inceleyebilirsiniz."
                : "Yorum #{$feedback->id} alındı. Yorumlar sayfasından inceleyebilirsiniz.",
            'data' => [
                'type' => $question ? 'product_question' : 'customer_review',
                'feedback_id' => $feedback->id,
                'store_id' => $feedback->store_id,
            ],
        ]);
    }
}
