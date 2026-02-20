<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UniversalNotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('universal_notifications') || !Schema::hasTable('users')) {
            $this->command->warn('UniversalNotificationSeeder: required tables do not exist. Skipping...');
            return;
        }

        $adminId = DB::table('users')
            ->where('activity_scope', 'system_level')
            ->orderBy('id')
            ->value('id') ?? 1;

        $sellerId = DB::table('users')
            ->where('activity_scope', 'store_level')
            ->orderBy('id')
            ->value('id') ?? $adminId;

        $deliverymanId = DB::table('users')
            ->where('activity_scope', 'delivery_level')
            ->orderBy('id')
            ->value('id') ?? $adminId;

        $rows = [
            [
                'notifiable_type' => 'admin',
                'notifiable_id' => $adminId,
                'order_id' => 5001,
                'title' => ['tr' => 'Yeni siparis alindi', 'en' => 'New order received'],
                'message' => ['tr' => 'Yeni bir siparis verildi: #5001.', 'en' => 'A new order #5001 has been placed.'],
                'status' => 'unread',
            ],
            [
                'notifiable_type' => 'admin',
                'notifiable_id' => $adminId,
                'order_id' => 5002,
                'title' => ['tr' => 'Siparis #5002 onaylandi', 'en' => 'Order #5002 is confirmed'],
                'message' => ['tr' => 'Siparis #5002 magaza tarafindan onaylandi.', 'en' => 'Order #5002 has been confirmed by the store.'],
                'status' => 'read',
            ],
            [
                'notifiable_type' => 'store',
                'notifiable_id' => $sellerId,
                'order_id' => 5003,
                'title' => ['tr' => 'Yeni siparis atandi', 'en' => 'New order assigned'],
                'message' => ['tr' => 'Siparis #5003 size atandi.', 'en' => 'Order #5003 has been assigned to you.'],
                'status' => 'unread',
            ],
            [
                'notifiable_type' => 'deliveryman',
                'notifiable_id' => $deliverymanId,
                'order_id' => 5004,
                'title' => ['tr' => 'Teslimat gorevi olustu', 'en' => 'Delivery task created'],
                'message' => ['tr' => 'Siparis #5004 teslimat icin hazir.', 'en' => 'Order #5004 is ready for delivery.'],
                'status' => 'unread',
            ],
        ];

        foreach ($rows as $row) {
            DB::table('universal_notifications')->updateOrInsert(
                [
                    'notifiable_type' => $row['notifiable_type'],
                    'notifiable_id' => $row['notifiable_id'],
                    'data' => json_encode(['order_id' => $row['order_id']]),
                ],
                [
                    'title' => json_encode($row['title'], JSON_UNESCAPED_UNICODE),
                    'message' => json_encode($row['message'], JSON_UNESCAPED_UNICODE),
                    'status' => $row['status'],
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $this->command->info('UniversalNotificationSeeder: multilingual notifications ensured.');
    }
}
