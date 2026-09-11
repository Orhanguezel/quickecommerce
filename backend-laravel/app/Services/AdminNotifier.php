<?php

namespace App\Services;

use App\Mail\DynamicEmail;
use App\Models\UniversalNotification;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
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
    public static function notify(string $title, string $message, array $data = [], bool $sendEmail = false): bool
    {
        return self::notifyAdmins(
            User::where('activity_scope', 'system_level')->where('status', 1)->get(),
            $title,
            $message,
            $data,
            $sendEmail
        );
    }

    /** Yalnizca birincil/aktif site adminine bildir (destek talepleri icin). */
    public static function notifyPrimarySiteAdmin(string $title, string $message, array $data = [], bool $sendEmail = false): bool
    {
        $admin = User::where('activity_scope', 'system_level')
            ->where('status', 1)
            ->orderBy('id')
            ->first();

        return self::notifyAdmins($admin ? collect([$admin]) : collect(), $title, $message, $data, $sendEmail);
    }

    private static function notifyAdmins($admins, string $title, string $message, array $data, bool $sendEmail): bool
    {
        try {
            if ($admins->isEmpty()) {
                Log::warning('AdminNotifier: sistem admini yok, bildirim atlandi.', ['title' => $title]);
                return false;
            }

            // 1) Panel cani (DB) — admin tipi bildirimleri tum adminler gorur,
            //    tek kayit yeterli (notifiable_id = ilk admin).
            UniversalNotification::create([
                'notifiable_id' => $admins->first()->id,
                'title' => $title,
                'message' => $message,
                'data' => $data,
                'notifiable_type' => 'admin',
                'status' => 'unread',
            ]);

            // 2) E-posta (opsiyonel) — kuyruga atilir, worker gonderir
            if ($sendEmail) {
                self::email($admins, $title, $message);
            }

            // 3) Firebase push — best-effort
            self::push($admins, $title, $message, $data);
            return true;
        } catch (\Throwable $e) {
            Log::error('AdminNotifier bildirim hatasi', [
                'title' => $title,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    private static function email($admins, string $title, string $message): void
    {
        try {
            $recipients = self::deliverableRecipients($admins);
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

    /**
     * Bildirim gonderilecek, GERCEKTEN teslim edilebilir adresler.
     *
     * Admin kullanicilarinin e-postasi ayni zamanda panel giris kimligidir;
     * posta kutusu olmayabilir. Ornek: admin@sportoonline.com -- alan adinin MX
     * kaydi yok, Gmail A kaydina (web sunucusu, 25 kapali) duser ve her bildirim
     * 46 saatlik bounce zinciri uretir. Bu yuzden:
     *   1) config('mail.admin_notify_recipients') doluysa admin kullanici
     *      e-postalari yerine o liste kullanilir,
     *   2) her alicinin alan adi MX kaydi icin dogrulanir, gecmeyen atlanir.
     *
     * @return array<int,string>
     */
    private static function deliverableRecipients($admins): array
    {
        $recipients = [];

        $configured = config('mail.admin_notify_recipients');
        if (!empty($configured)) {
            $recipients = preg_split('/[,;\s]+/', (string) $configured, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        } else {
            foreach ($admins as $a) {
                if (!empty($a->email)) {
                    $recipients[] = $a->email;
                }
            }
        }

        $siteEmail = function_exists('com_option_get') ? com_option_get('com_site_email') : null;
        if (!empty($siteEmail)) {
            $recipients[] = $siteEmail;
        }

        $recipients = array_unique(array_filter(array_map('trim', $recipients)));

        $deliverable = [];
        $skipped = [];
        foreach ($recipients as $address) {
            if (self::isDeliverable($address)) {
                $deliverable[] = $address;
            } else {
                $skipped[] = $address;
            }
        }

        if (!empty($skipped)) {
            Log::warning('AdminNotifier: teslim edilemeyecek alici atlandi (MX kaydi yok).', [
                'skipped' => $skipped,
            ]);
        }

        return array_values($deliverable);
    }

    /** Adres gecerli mi ve alan adinin MX kaydi var mi (cache'li). */
    private static function isDeliverable(string $address): bool
    {
        if (!filter_var($address, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        if (!config('mail.verify_recipient_mx', true)) {
            return true;
        }

        $domain = strtolower(substr(strrchr($address, '@') ?: '', 1));
        if ($domain === '') {
            return false;
        }

        try {
            // Pozitif sonuc uzun, negatif sonuc kisa sure cache'lenir: gecici
            // DNS hatasi bildirimleri kalici olarak susturmasin.
            $cached = Cache::get('mail_mx_ok:' . $domain);
            if ($cached !== null) {
                return (bool) $cached;
            }

            $hasMx = checkdnsrr($domain, 'MX');
            Cache::put('mail_mx_ok:' . $domain, $hasMx, $hasMx ? now()->addDays(7) : now()->addHour());

            return $hasMx;
        } catch (\Throwable $e) {
            // DNS sorgulanamiyorsa engelleme (fail-open): bildirim kaybetmektense
            // olasi bir bounce'a katlan.
            Log::warning('AdminNotifier MX kontrolu yapilamadi', [
                'domain' => $domain,
                'error' => $e->getMessage(),
            ]);

            return true;
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
