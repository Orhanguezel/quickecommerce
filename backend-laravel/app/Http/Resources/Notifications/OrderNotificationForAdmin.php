<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderNotificationForAdmin extends JsonResource
{
    private function resolveLanguage(Request $request): string
    {
        $language = strtolower((string) ($request->input('language') ?? app()->getLocale() ?? 'en'));
        return str_starts_with($language, 'tr') ? 'tr' : 'en';
    }

    private function decodeMultilangText(?string $value, string $language): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $decoded = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            if (isset($decoded[$language]) && is_string($decoded[$language])) {
                return $decoded[$language];
            }
            if (isset($decoded['en']) && is_string($decoded['en'])) {
                return $decoded['en'];
            }
            if (isset($decoded['tr']) && is_string($decoded['tr'])) {
                return $decoded['tr'];
            }
        }

        return $value;
    }

    private function localizeOrderText(string $text, string $language): string
    {
        if ($language !== 'tr') {
            return $text;
        }

        $patterns = [
            '/^A new order #(\d+) has been placed\.$/' => 'Yeni bir siparis verildi: #$1.',
            '/^A new order #(\d+) is pending confirmation\.$/' => 'Yeni siparis #$1 onay bekliyor.',
            '/^Order #(\d+) has been confirmed by the store\.$/' => 'Siparis #$1 magaza tarafindan onaylandi.',
            '/^Order #(\d+) is being processed\.$/' => 'Siparis #$1 hazirlaniyor.',
            '/^Order #(\d+) has been shipped\.$/' => 'Siparis #$1 kargoya verildi.',
            '/^Order #(\d+) has been successfully delivered\.$/' => 'Siparis #$1 basariyla teslim edildi.',
            '/^Order #(\d+) has been cancelled\.$/' => 'Siparis #$1 iptal edildi.',
            '/^Order #(\d+) has been updated\.$/' => 'Siparis #$1 guncellendi.',
            '/^Order Placed Successfully\.$/' => 'Siparis basariyla olusturuldu.',
            '/^Order #(\d+) is pending$/' => 'Siparis #$1 onay bekliyor',
            '/^Order #(\d+) is confirmed$/' => 'Siparis #$1 onaylandi',
            '/^Order #(\d+) is processing$/' => 'Siparis #$1 hazirlaniyor',
            '/^Order #(\d+) is shipped$/' => 'Siparis #$1 kargoya verildi',
            '/^Order #(\d+) is delivered$/' => 'Siparis #$1 teslim edildi',
            '/^Order #(\d+) is cancelled$/' => 'Siparis #$1 iptal edildi',
            '/^New Order Assigned: #(\d+)$/' => 'Yeni Siparis Atandi: #$1',
            '/^Deliveryman Assigned for Order: #(\d+)$/' => 'Siparis #$1 icin kurye atandi',
        ];

        foreach ($patterns as $pattern => $replacement) {
            $translated = preg_replace($pattern, $replacement, $text);
            if ($translated !== null && $translated !== $text) {
                return $translated;
            }
        }

        return $text;
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $language = $this->resolveLanguage($request);
        $title = $this->decodeMultilangText($this->title, $language);
        $message = $this->decodeMultilangText($this->message, $language);

        $title = is_string($title) ? $this->localizeOrderText($title, $language) : $title;
        $message = is_string($message) ? $this->localizeOrderText($message, $language) : $message;

        return [
            'id' => $this->id,
            'title' => $title,
            'message' => $message,
            'notifiable_type' => $this->notifiable_type,
            'notifiable_id' => $this->notifiable_id,
            'data' => is_array($this->data) ? $this->data : json_decode((string) $this->data, true),
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}
