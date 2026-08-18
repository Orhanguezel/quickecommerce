<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SearchNormalizer
{
    private const SYNONYMS = [
        'dambil' => ['dumbbell', 'dumbell'],
        'dumbbell' => ['dambil', 'dumbell'],
        'dumbell' => ['dambil', 'dumbbell'],
        'kreatin' => ['creatine'],
        'creatine' => ['kreatin'],
        'protein tozu' => ['whey protein', 'whey'],
        'whey' => ['protein tozu'],
        'sporcu mati' => ['fitness mat', 'yoga mat', 'pilates mat'],
        'kosu bandi' => ['treadmill'],
        'treadmill' => ['kosu bandi'],
        'agirlik' => ['plaka', 'dambil'],
        'esofman' => ['jogger'],
        'mont' => ['ceket'],
        'nutrent' => ['nutrend'],
    ];

    public function normalize(?string $value): string
    {
        $value = mb_strtolower(trim((string) $value), 'UTF-8');
        $value = strtr($value, [
            'ı' => 'i', 'İ' => 'i', 'ş' => 's', 'Ş' => 's', 'ğ' => 'g', 'Ğ' => 'g',
            'ü' => 'u', 'Ü' => 'u', 'ö' => 'o', 'Ö' => 'o', 'ç' => 'c', 'Ç' => 'c',
            'â' => 'a', 'î' => 'i', 'û' => 'u',
        ]);
        $value = preg_replace('/\p{Mn}+/u', '', $value) ?? $value;
        $value = preg_replace('/[^a-z0-9]+/u', ' ', $value) ?? $value;
        return trim(preg_replace('/\s+/u', ' ', $value) ?? $value);
    }

    public function expandedTokens(string $query): array
    {
        $normalized = $this->normalize($query);
        $tokens = collect(explode(' ', $normalized))->filter(fn ($token) => strlen($token) >= 2)->take(6);
        $vocabulary = $this->vocabulary();

        return $tokens->map(function (string $token) use ($vocabulary) {
            $alternatives = [$token];
            foreach (self::SYNONYMS as $key => $values) {
                if ($token === $key || in_array($token, explode(' ', $key), true)) {
                    foreach ($values as $value) {
                        array_push($alternatives, ...explode(' ', $this->normalize($value)));
                    }
                }
            }

            if (strlen($token) >= 4 && !isset($vocabulary[$token])) {
                $maxDistance = strlen($token) >= 8 ? 2 : 1;
                $best = null;
                $bestDistance = $maxDistance + 1;
                foreach ($vocabulary as $word => $count) {
                    if (abs(strlen($word) - strlen($token)) > $maxDistance || $count < 2) continue;
                    $distance = levenshtein($token, $word);
                    if ($distance < $bestDistance) {
                        $best = $word;
                        $bestDistance = $distance;
                    }
                }
                if ($best !== null && $bestDistance <= $maxDistance) $alternatives[] = $best;
            }

            return array_values(array_unique(array_filter($alternatives)));
        })->values()->all();
    }

    public function productSearchText(object $product): string
    {
        return mb_substr($this->normalize(implode(' ', array_filter([
            $product->name ?? null,
            strip_tags((string) ($product->description ?? '')),
            $product->meta_keywords ?? null,
            $product->slug ?? null,
        ]))), 0, 4000);
    }

    public function forgetVocabulary(): void
    {
        Cache::forget('search:vocabulary:v1');
    }

    private function vocabulary(): array
    {
        return Cache::remember('search:vocabulary:v1', now()->addDay(), function () {
            $counts = [];
            DB::table('products')->whereNull('deleted_at')->where('status', 'approved')
                ->orderBy('id')->select(['id', 'name'])->chunkById(1000, function ($rows) use (&$counts) {
                    foreach ($rows as $row) {
                        foreach (explode(' ', $this->normalize($row->name)) as $word) {
                            if (strlen($word) >= 3) $counts[$word] = ($counts[$word] ?? 0) + 1;
                        }
                    }
                });
            return $counts;
        });
    }
}
