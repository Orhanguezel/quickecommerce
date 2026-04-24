<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExperimentAssignment extends Model
{
    protected $fillable = [
        'experiment_id',
        'subject',
        'variant_key',
        'exposed_at',
        'converted_at',
    ];

    protected $casts = [
        'exposed_at'   => 'datetime',
        'converted_at' => 'datetime',
    ];

    public function experiment(): BelongsTo
    {
        return $this->belongsTo(Experiment::class);
    }
}
