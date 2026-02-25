<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\ShippingCampaign;
use Illuminate\Http\Request;

class ShippingCampaignController extends Controller
{
    public function index(Request $request)
    {
        $perPage  = $request->per_page ?? 10;
        $page     = $request->page ?? 1;
        $search   = $request->search ?? '';

        $query = ShippingCampaign::query();

        if ($search) {
            $query->where('title', 'like', "%{$search}%");
        }

        $campaigns = $query->orderBy('id', 'desc')->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $campaigns->map(fn($c) => $this->format($c)),
            'meta' => [
                'current_page' => $campaigns->currentPage(),
                'last_page'    => $campaigns->lastPage(),
                'per_page'     => $campaigns->perPage(),
                'total'        => $campaigns->total(),
                'from'         => $campaigns->firstItem(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'image'              => 'nullable|string',
            'background_color'   => 'nullable|string|max:20',
            'title_color'        => 'nullable|string|max:20',
            'description_color'  => 'nullable|string|max:20',
            'button_text'        => 'nullable|string|max:255',
            'button_text_color'  => 'nullable|string|max:20',
            'button_bg_color'    => 'nullable|string|max:20',
            'button_url'         => 'nullable|string|max:500',
            'min_order_value'    => 'required|numeric|min:0',
            'status'             => 'nullable|boolean',
        ]);

        $campaign = ShippingCampaign::create($validated);

        if ($campaign) {
            return $this->success(__('messages.save_success', ['name' => 'Shipping Campaign']));
        }
        return $this->failed(__('messages.save_failed', ['name' => 'Shipping Campaign']));
    }

    public function show($id)
    {
        $campaign = ShippingCampaign::findOrFail($id);
        return response()->json(['data' => $this->format($campaign)]);
    }

    public function update(Request $request, $id)
    {
        $campaign = ShippingCampaign::findOrFail($id);

        $validated = $request->validate([
            'title'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'image'              => 'nullable|string',
            'background_color'   => 'nullable|string|max:20',
            'title_color'        => 'nullable|string|max:20',
            'description_color'  => 'nullable|string|max:20',
            'button_text'        => 'nullable|string|max:255',
            'button_text_color'  => 'nullable|string|max:20',
            'button_bg_color'    => 'nullable|string|max:20',
            'button_url'         => 'nullable|string|max:500',
            'min_order_value'    => 'required|numeric|min:0',
            'status'             => 'nullable|boolean',
        ]);

        $campaign->update($validated);

        return $this->success(__('messages.update_success', ['name' => 'Shipping Campaign']));
    }

    public function destroy($id)
    {
        $campaign = ShippingCampaign::findOrFail($id);
        $campaign->delete();

        return $this->success(__('messages.delete_success', ['name' => 'Shipping Campaign']));
    }

    public function changeStatus(Request $request)
    {
        $request->validate(['id' => 'required|exists:shipping_campaigns,id']);

        $campaign = ShippingCampaign::findOrFail($request->id);
        $campaign->update(['status' => !$campaign->status]);

        return response()->json([
            'message' => __('messages.update_success', ['name' => 'Shipping Campaign status']),
        ]);
    }

    private function format(ShippingCampaign $c): array
    {
        return [
            'id'               => $c->id,
            'title'            => $c->title,
            'description'      => $c->description,
            'image'            => $c->image,
            'image_url'        => $c->image_url,
            'background_color' => $c->background_color,
            'title_color'      => $c->title_color,
            'description_color'=> $c->description_color,
            'button_text'      => $c->button_text,
            'button_text_color'=> $c->button_text_color,
            'button_bg_color'  => $c->button_bg_color,
            'button_url'       => $c->button_url,
            'min_order_value'  => (float) $c->min_order_value,
            'status'           => (bool) $c->status,
            'created_at'       => $c->created_at,
        ];
    }
}
