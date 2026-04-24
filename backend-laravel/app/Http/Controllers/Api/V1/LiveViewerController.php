<?php

namespace App\Http\Controllers\Api\V1;


use App\Services\LiveViewerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiveViewerController extends Controller
{
    public function __construct(protected LiveViewerService $service) {}

    /** POST /v1/products/{id}/live-viewers/heartbeat */
    public function heartbeat(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:64',
        ]);
        $count = $this->service->heartbeat($id, $validated['subject']);
        return response()->json(['status' => true, 'viewers' => $count]);
    }

    /** GET /v1/products/{id}/live-viewers */
    public function count(int $id): JsonResponse
    {
        return response()->json([
            'status'  => true,
            'viewers' => $this->service->count($id),
        ]);
    }
}
