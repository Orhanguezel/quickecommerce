<?php

namespace Tests\Unit;

use App\Services\AdPilotSelectionService;
use Illuminate\Support\Collection;
use PHPUnit\Framework\TestCase;

class AdPilotSelectionServiceTest extends TestCase
{
    public function test_it_preserves_rank_while_enforcing_the_store_cap(): void
    {
        $candidates = new Collection([
            (object) ['id' => 1, 'store_id' => 10],
            (object) ['id' => 2, 'store_id' => 10],
            (object) ['id' => 3, 'store_id' => 10],
            (object) ['id' => 4, 'store_id' => 20],
            (object) ['id' => 5, 'store_id' => 20],
            (object) ['id' => 6, 'store_id' => 30],
        ]);

        $selected = (new AdPilotSelectionService)->diversify($candidates, 5, 40);

        self::assertSame([1, 2, 4, 5, 6], $selected->pluck('id')->all());
        self::assertLessThanOrEqual(2, $selected->groupBy('store_id')->max(fn ($rows) => $rows->count()));
    }

    public function test_it_returns_fewer_products_instead_of_breaking_the_guardrail(): void
    {
        $candidates = collect(range(1, 10))->map(fn (int $id) => (object) [
            'id' => $id,
            'store_id' => 10,
        ]);

        $selected = (new AdPilotSelectionService)->diversify($candidates, 5, 40);

        self::assertCount(2, $selected);
    }
}
