<?php

namespace App\Console\Commands;

use App\Services\AdminNotifier;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ReportZeroResultSearches extends Command
{
    protected $signature = 'search:report-zero-results {--hours=24} {--min-count=2} {--notify}';
    protected $description = 'Report repeated zero-result searches so catalogue/search gaps are actionable';

    public function handle(): int
    {
        $hours = max(1, (int) $this->option('hours'));
        $minimum = max(1, (int) $this->option('min-count'));
        $rows = DB::table('search_logs')->where('created_at', '>=', now()->subHours($hours))
            ->where('results_count', 0)
            ->selectRaw('LOWER(TRIM(term)) term, COUNT(*) searches')
            ->groupByRaw('LOWER(TRIM(term))')->havingRaw('COUNT(*) >= ?', [$minimum])
            ->orderByDesc('searches')->limit(20)->get();

        $this->table(['Search', 'Count'], $rows->map(fn ($row) => [$row->term, $row->searches])->all());
        if ($this->option('notify') && $rows->isNotEmpty()) {
            AdminNotifier::notifyPrimarySiteAdmin(
                'Sıfır sonuçlu aramalar',
                $rows->map(fn ($row) => "{$row->term}: {$row->searches}")->implode("\n"),
                ['type' => 'zero_result_searches', 'hours' => $hours, 'rows' => $rows->toArray()],
                true,
            );
        }
        return self::SUCCESS;
    }
}
