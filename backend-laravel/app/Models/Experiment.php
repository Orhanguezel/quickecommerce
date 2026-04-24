<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Experiment extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'status',
        'variants',
        'traffic_allocation',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'variants'            => 'array',
        'traffic_allocation'  => 'integer',
        'started_at'          => 'datetime',
        'ended_at'            => 'datetime',
    ];

    public function assignments(): HasMany
    {
        return $this->hasMany(ExperimentAssignment::class);
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    /**
     * Deterministically pick a variant for a subject using a stable hash.
     * Same (experiment_key + subject) always yields the same variant.
     */
    public function pickVariantFor(string $subject): ?string
    {
        if (!$this->isRunning() || empty($this->variants)) {
            return null;
        }

        // Traffic allocation gate: returns null for excluded subjects
        $allocBucket = hexdec(substr(hash('sha256', "{$this->key}:alloc:{$subject}"), 0, 8)) % 100;
        if ($allocBucket >= ($this->traffic_allocation ?? 100)) {
            return null;
        }

        $bucket = hexdec(substr(hash('sha256', "{$this->key}:{$subject}"), 0, 8)) % 100;
        $acc = 0;
        foreach ($this->variants as $variant) {
            $weight = (int) ($variant['weight'] ?? 0);
            $acc += $weight;
            if ($bucket < $acc) {
                return (string) ($variant['key'] ?? 'control');
            }
        }
        // Fallback to last variant if weights don't sum to 100
        return (string) ($this->variants[array_key_last($this->variants)]['key'] ?? 'control');
    }
}
