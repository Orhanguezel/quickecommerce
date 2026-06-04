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
    ];

    protected $casts = [
        'telegram_sent' => 'boolean',
        'sent_at' => 'datetime',
        'scraper_run_id' => 'integer',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(ScraperRun::class, 'scraper_run_id');
    }
}
