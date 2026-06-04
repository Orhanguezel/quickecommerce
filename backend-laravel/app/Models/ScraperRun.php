<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Tek bir scraper kosturma kaydi.
 *
 * Cron veya manuel olarak baslatilan her scraper denemesini izler:
 * - basari/fail durumu (exit_code)
 * - kac urun toplandi
 * - JSON cikti boyutu
 * - fail durumunda son log satirlari
 *
 * scraper_alerts ile iliskisi: bir run fail ederse o run icin alert
 * uretilir; alert -> run baglantisi tablodan izlenebilir.
 */
class ScraperRun extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_name',
        'triggered_by',
        'started_at',
        'finished_at',
        'exit_code',
        'products_scraped',
        'json_size_bytes',
        'duration_seconds',
        'error_log_excerpt',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'exit_code' => 'integer',
        'products_scraped' => 'integer',
        'json_size_bytes' => 'integer',
        'duration_seconds' => 'integer',
    ];

    public function alerts(): HasMany
    {
        return $this->hasMany(ScraperAlert::class);
    }

    public function isSuccess(): bool
    {
        return $this->exit_code === 0;
    }
}
