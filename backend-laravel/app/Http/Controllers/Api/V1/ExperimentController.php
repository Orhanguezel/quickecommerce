<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Experiment;
use App\Models\ExperimentAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public A/B experiment endpoints.
 *
 * Flow:
 *   1. Frontend mounts → POST /experiments/assign with { subject }
 *   2. Backend returns { [key]: variant_key } for every running experiment
 *   3. Frontend caches in localStorage and uses via useExperiment(key)
 *   4. On exposure/conversion, frontend POSTs /experiments/track
 *
 * Assignment is deterministic by hash so it's stable across requests.
 * We still persist to DB so admin can compute per-variant conversion.
 */
class ExperimentController extends Controller
{
    public function assign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:64',
        ]);

        $subject = $validated['subject'];
        $experiments = Experiment::query()
            ->where('status', 'running')
            ->get();

        $assignments = [];
        foreach ($experiments as $exp) {
            $variantKey = $exp->pickVariantFor($subject);
            if ($variantKey === null) continue;

            // Persist once; subsequent calls reuse the same row.
            ExperimentAssignment::firstOrCreate(
                ['experiment_id' => $exp->id, 'subject' => $subject],
                ['variant_key' => $variantKey]
            );

            $assignments[$exp->key] = $variantKey;
        }

        return response()->json([
            'status'      => true,
            'assignments' => $assignments,
        ]);
    }

    /**
     * Records an exposure or conversion event. Called from the frontend
     * the first time a user sees the experiment-influenced UI (exposure)
     * and again when the business outcome fires (conversion).
     */
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'experiment_key' => 'required|string|max:128',
            'subject'        => 'required|string|max:64',
            'event'          => 'required|in:exposed,converted',
        ]);

        $experiment = Experiment::where('key', $validated['experiment_key'])->first();
        if (!$experiment) {
            return response()->json(['status' => false], 404);
        }

        $assignment = ExperimentAssignment::where([
            'experiment_id' => $experiment->id,
            'subject'       => $validated['subject'],
        ])->first();

        if (!$assignment) {
            return response()->json(['status' => false], 404);
        }

        $column = $validated['event'] === 'exposed' ? 'exposed_at' : 'converted_at';
        if (empty($assignment->{$column})) {
            $assignment->{$column} = now();
            $assignment->save();
        }

        return response()->json(['status' => true]);
    }
}
