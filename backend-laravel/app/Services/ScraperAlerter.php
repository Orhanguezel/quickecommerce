<?php

namespace App\Services;

use App\Models\ScraperAlert;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Scraper saglik / hata alarmlari icin tek noktadan Telegram bildirimi.
 *
 * 2026-06-04: 10 gun boyunca provitanya sessizce 404 alip yok satisa sebep
 * oldu (cron exit 1 -> kimse okumadi). Bu sinifin amaci: scraper / sync
 * katmanindaki bir sapma anlik olarak owner'a dussun.
 *
 * Config (.env):
 *   TELEGRAM_ALARM_BOT_TOKEN, TELEGRAM_ALARM_CHAT_ID
 * (Monitor5xxAlarm ile ayni env degiskenleri — tek bot, iki kanal.)
 * Bos config'te no-op (log) -> staging/dev ortaminda guvenli.
 */
class ScraperAlerter
{
    public const LEVEL_INFO = 'info';
    public const LEVEL_WARN = 'warning';
    public const LEVEL_CRIT = 'critical';

    private const LEVEL_EMOJI = [
        self::LEVEL_INFO => 'ℹ️',
        self::LEVEL_WARN => '⚠️',
        self::LEVEL_CRIT => '🚨',
    ];

    /**
     * Alarm gonder + DB'ye kaydet.
     *
     * @param array{source_name?: ?string, scraper_run_id?: ?int} $context
     */
    public static function alert(
        string $title,
        string $body,
        string $level = self::LEVEL_WARN,
        array $context = []
    ): bool {
        // 2026-06-04: Her alarm DB'ye log edilir (admin dashboard feed icin).
        // Telegram gonderimi basarisiz olsa bile kayit tutulur.
        $record = ScraperAlert::create([
            'level' => $level,
            'title' => $title,
            'body' => $body,
            'source_name' => $context['source_name'] ?? null,
            'scraper_run_id' => $context['scraper_run_id'] ?? null,
            'telegram_sent' => false,
        ]);

        $token = env('TELEGRAM_ALARM_BOT_TOKEN');
        $chatId = env('TELEGRAM_ALARM_CHAT_ID');

        if (!$token || !$chatId) {
            Log::info('ScraperAlerter: Telegram config yok, alarm sadece DB+log\'a yazildi.', [
                'title' => $title, 'level' => $level,
            ]);
            return false;
        }

        $emoji = self::LEVEL_EMOJI[$level] ?? self::LEVEL_EMOJI[self::LEVEL_WARN];
        $text = "{$emoji} <b>" . self::escape($title) . "</b>\n\n" . self::escape($body);

        try {
            $resp = Http::timeout(10)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
                'disable_web_page_preview' => true,
            ]);

            if (!$resp->successful()) {
                Log::warning('ScraperAlerter: Telegram API hata', [
                    'status' => $resp->status(),
                    'body' => $resp->body(),
                ]);
                return false;
            }
            $msgId = (string) ($resp->json('result.message_id') ?? '');
            $record->update([
                'telegram_sent' => true,
                'telegram_message_id' => $msgId,
                'sent_at' => now(),
            ]);
            return true;
        } catch (\Throwable $e) {
            Log::warning('ScraperAlerter: Telegram istek hatasi', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /** Birden fazla alarm'i tek mesajda toplar (cron sonu ozeti). */
    public static function digest(string $title, array $items, string $level = self::LEVEL_WARN): bool
    {
        if (empty($items)) {
            return false;
        }
        $body = implode("\n", array_map(fn ($i) => "• " . self::escape((string) $i), $items));
        return self::alert($title, $body, $level);
    }

    private static function escape(string $text): string
    {
        return str_replace(['<', '>', '&'], ['&lt;', '&gt;', '&amp;'], $text);
    }
}
