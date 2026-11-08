<?php

namespace App\Http\Controllers\Api\V1\Whatsapp;

use App\Http\Controllers\Api\V1\Controller;
use App\Services\Whatsapp\WhatsappConsentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class PreferenceController extends Controller
{
    public function show(Request $r)
    {
        $id = auth('api_customer')->id();
        $preference = DB::table('whatsapp_consents')->where(['customer_id' => $id, 'scope_key' => 'account:'.$id])->first();

        return response()->json(['available' => $this->available(), 'enabled' => (bool) ($preference->enabled ?? false), 'phone' => $preference->phone ?? '', 'text_version' => WhatsappConsentService::TEXT_VERSION]);
    }

    private function available(): bool
    {
        $connection = \App\Models\WhatsappConnection::current();

        return (bool) config('whatsapp.enabled') && $connection?->enabled && ! $connection->pilot_mode
            && $connection->subscribed && ($connection->health['connected'] ?? false)
            && ($connection->health['messaging_status'] ?? '') === 'AVAILABLE';
    }

    public function save(Request $r, WhatsappConsentService $service)
    {
        $data = $r->validate(['phone' => 'required|string|max:30', 'enabled' => 'required|boolean', 'text_version' => 'required|in:'.WhatsappConsentService::TEXT_VERSION]);
        $customer = auth('api_customer')->user();
        abort_if($data['enabled'] && (! $this->available() || $customer->is_guest), 422, 'Hesap bildirimi şu anda açılamıyor.');
        $service->save($customer->id, 'account:'.$customer->id, $data['phone'], $data['enabled'], 'account');

        return $this->show($r);
    }
}
