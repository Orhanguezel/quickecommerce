<?php

namespace App\Services;

use Illuminate\Support\Collection;

class AdPilotSelectionService
{
    public function diversify(Collection $rankedCandidates, int $limit, int $maxStoreSharePercent): Collection
    {
        $limit = max(1, $limit);
        $storeCap = max(1, (int) floor($limit * (max(1, min(100, $maxStoreSharePercent)) / 100)));
        $storeCounts = [];

        return $rankedCandidates
            ->filter(function ($candidate) use (&$storeCounts, $storeCap): bool {
                $storeId = (int) data_get($candidate, 'store_id');
                if (($storeCounts[$storeId] ?? 0) >= $storeCap) {
                    return false;
                }

                $storeCounts[$storeId] = ($storeCounts[$storeId] ?? 0) + 1;

                return true;
            })
            ->take($limit)
            ->values();
    }
}
