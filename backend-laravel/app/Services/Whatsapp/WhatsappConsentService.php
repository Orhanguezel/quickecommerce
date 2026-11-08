<?php

namespace App\Services\Whatsapp;

use Illuminate\Support\Facades\DB;

final class WhatsappConsentService
{
    public const TEXT_VERSION = 'sportoonline-order-updates-2026-11-08';

    public function save(int $customerId, string $scope, string $phone, bool $enabled, string $source): void
    {
        $phone = ! $enabled && $phone === '' ? '' : WhatsappPhone::normalize($phone);
        DB::transaction(function () use ($customerId, $scope, $phone, $enabled, $source) {
            DB::table('whatsapp_consents')->updateOrInsert(['customer_id' => $customerId, 'scope_key' => $scope], [
                'phone' => $phone, 'enabled' => $enabled, 'text_version' => self::TEXT_VERSION, 'source' => $source, 'updated_at' => now(), 'created_at' => now(),
            ]);
            DB::table('whatsapp_consent_events')->insert(['customer_id' => $customerId, 'scope_key' => $scope, 'phone' => $phone, 'enabled' => $enabled,
                'text_version' => self::TEXT_VERSION, 'source' => $source, 'created_at' => now()]);
            if ($enabled) {
                DB::table('whatsapp_opt_outs')->where('phone', $phone)->delete();
            } elseif (str_starts_with($scope, 'account:')) {
                $this->optOut($phone, $source);
            }
        });
    }

    public function resolve(int $customerId, ?int $masterId): ?object
    {
        $scope = $masterId ? DB::table('whatsapp_consents')->where(['customer_id' => $customerId, 'scope_key' => 'order:'.$masterId])->first() : null;
        $scope ??= DB::table('whatsapp_consents')->where(['customer_id' => $customerId, 'scope_key' => 'account:'.$customerId])->first();
        if (! $scope || ! $scope->enabled || $this->blocked($scope->phone)) {
            return null;
        }

        return $scope;
    }

    public function blocked(string $recipient): bool
    {
        return DB::table('whatsapp_opt_outs')->where('phone', $recipient)->exists();
    }

    public function optOut(string $phone, string $source = 'whatsapp'): void
    {
        DB::transaction(function () use ($phone, $source) {
            DB::table('whatsapp_opt_outs')->insertOrIgnore(['phone' => $phone, 'created_at' => now()]);
            $consents = DB::table('whatsapp_consents')->where('phone', $phone)->where('enabled', true)->get();
            foreach ($consents as $consent) {
                DB::table('whatsapp_consent_events')->insert(['customer_id' => $consent->customer_id, 'scope_key' => $consent->scope_key,
                    'phone' => $phone, 'enabled' => false, 'text_version' => self::TEXT_VERSION, 'source' => $source, 'created_at' => now()]);
            }
            DB::table('whatsapp_consents')->where('phone', $phone)->update(['enabled' => false, 'updated_at' => now()]);
            DB::table('whatsapp_messages')->where('recipient', $phone)->where('direction', 'outbound')->whereIn('status', ['pending', 'retry_wait'])
                ->update(['status' => 'suppressed', 'reason' => 'opted_out', 'updated_at' => now()]);
        });
    }
}
