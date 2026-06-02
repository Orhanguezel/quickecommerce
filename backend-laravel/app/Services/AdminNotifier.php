<?php

namespace App\Services;

use App\Mail\DynamicEmail;
use App\Models\UniversalNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Tum sistem adminlerine guvenilir bildirim primitive'i.
 *
 * Adminler bu kurulumda users.activity_scope='system_level' ile tanimli
 * (super_admin slug'i / roles.slug YOK). Tek noktadan: panel cani (DB) +
 * opsiyonel e-posta + best-effort Firebase push. Her hata sessizce loglanir,
 * cagiran akisi (siparis, uyelik, AI sohbet vb.) asla bozmaz.
 */
class AdminNotifier
{
    /**
     * @param  array<string,mixed>  $data   Bildirim payload (type, ilgili id'ler)
     * @param  bool  $sendEmail  E-posta da gonderilsin mi (kritik olaylar icin)
     */
    public static function notify(string $title, string $message, array $data = [], bool $sendEmail = false): void
    {
        try {
            $admins = User::where('activity_scope', 'system_level')->get();
            if ($admins->isEmpty()) {
                Log::warning('AdminNotifier: sistem admini yok, bildirim atlandi.', ['title' => $title]);
                return;
            }

            // 1) Panel cani (DB) — admin tipi bildirimleri tum adminler gorur,
            //    tek kayit yeterli (notifiable_id = ilk admin).
            UniversalNotification::create([
                'notifiable_id' => $admins->first()->id,
                'title' => $title,
                'message' => $message,
                'data' => json_encode($data, JSON_UNESCAPED_UNICODE),
                'notifiable_type' => 'admin',
                'status' => 'unread',
            ]);

            // 2) E-posta (opsiyonel) — kuyruga atilir, worker gonderir
            if ($sendEmail) {
                self::email($admins, $title, $message);
            }

            // 3) Firebase push — best-effort
            self::push($admins, $title, $message, $data);
        } catch (\Throwable $e) {
            Log::error('AdminNotifier bildirim hatasi', [
                'title' => $title,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private static function email($admins, string $title, string $message): void
    {
        try {
            $recipients = [];
            foreach ($admins as $a) {
                if (!empty($a->email)) {
                    $recipients[] = $a->email;
                }
            }
            $siteEmail = function_exists('com_option_get') ? com_option_get('com_site_email') : null;
            if (!empty($siteEmail)) {
                $recipients[] = $siteEmail;
            }
            $recipients = array_filter(array_unique($recipients));
            if (empty($recipients)) {
                return;
            }

            $body = '<p>' . e($message) . '</p>';
            foreach ($recipients as $to) {
                Mail::to($to)->queue(new DynamicEmail($title, $body));
            }
        } catch (\Throwable $e) {
            Log::warning('AdminNotifier e-posta hatasi', ['error' => $e->getMessage()]);
        }
    }

    private static function push($admins, string $title, string $body, array $data): void
    {
        try {
            $tokens = [];
            foreach ($admins as $a) {
                if (empty($a->firebase_token)) {
                    continue;
                }
                foreach ((is_array($a->firebase_token) ? $a->firebase_token : [$a->firebase_token]) as $t) {
                    $tokens[] = $t;
                }
            }
            $tokens = array_filter(array_unique($tokens));
            if (empty($tokens)) {
                return;
            }

            $credentialsPath = storage_path('app/firebase/firebase.json');
            if (!file_exists($credentialsPath)) {
                return;
            }

            $factory = (new \Kreait\Firebase\Factory)->withServiceAccount($credentialsPath);
            $messaging = $factory->createMessaging();
            $payload = array_map(fn ($v) => is_scalar($v) ? (string) $v : json_encode($v), $data);

            foreach ($tokens as $token) {
                $cloud = \Kreait\Firebase\Messaging\CloudMessage::withTarget('token', $token)
                    ->withNotification(\Kreait\Firebase\Messaging\Notification::create($title, $body))
                    ->withData($payload);
                $messaging->send($cloud);
            }
        } catch (\Throwable $e) {
            Log::warning('AdminNotifier Firebase push hatasi', ['error' => $e->getMessage()]);
        }
    }
}
