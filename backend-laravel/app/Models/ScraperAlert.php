<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Scraper sisteminin urettigi bir alarm kaydi.
 *
 * Tipik kaynaklari:
 *  - run-all.sh exit !=0 tespiti (kaynak spesifik, level=critical)
 *  - scrapers:health-check digest (genel rapor, level=warning)
 *  - Manuel scraper:record-run --fail (level=critical)
 *
 * Telegram'a gonderilip gonderilmedigi telegram_sent ile izlenir.
 */
class ScraperAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'level',
        'title',
        'body',
        'source_name',
        'scraper_run_id',
        'telegram_sent',
        'telegram_message_id',
        'sent_at',
        'resolved_at',
        'resolved_by',
    ];

    protected $casts = [
        'telegram_sent' => 'boolean',
        'sent_at' => 'datetime',
        'resolved_at' => 'datetime',
        'scraper_run_id' => 'integer',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(ScraperRun::class, 'scraper_run_id');
    }

    /** Henuz cozulmemis (acik) alarmlar. */
    public function scopeOpen($query)
    {
        return $query->whereNull('resolved_at');
    }

    /** Cozulmus alarmlar. */
    public function scopeResolved($query)
    {
        return $query->whereNotNull('resolved_at');
    }

    public function isResolved(): bool
    {
        return $this->resolved_at !== null;
    }

    /** Alarmi cozuldu olarak isaretle (idempotent). */
    public function markResolved(string $by): bool
    {
        if ($this->resolved_at !== null) {
            return false;
        }
        $this->resolved_at = now();
        $this->resolved_by = $by;
        return $this->save();
    }

    /**
     * Bir kaynagin tum ACIK alarmlarini coz. Basarili scrape sonrasi otomatik
     * cagrilir (by='auto') veya admin panelden. Cozulen sayisini doner.
     */
    public static function resolveOpenForSource(string $sourceName, string $by): int
    {
        return static::query()
            ->where('source_name', $sourceName)
            ->whereNull('resolved_at')
            ->update([
                'resolved_at' => now(),
                'resolved_by' => $by,
                'updated_at' => now(),
            ]);
    }
}
