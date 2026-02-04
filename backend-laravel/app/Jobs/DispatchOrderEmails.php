<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\GlobalEmailService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class DispatchOrderEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $order_master_id;

    public function __construct($order_master_id)
    {
        $this->order_master_id = $order_master_id;
    }

    public function handle(GlobalEmailService $globalEmailService)
    {
        // Eager load all necessary relationships
        $all_orders = Order::with(['store.seller', 'orderMaster.customer', 'orderMaster.orderAddress'])
            ->where('order_master_id', $this->order_master_id)
            ->get();

        $system_global_email = com_option_get('com_site_email');
        // Call service method to send emails
        $globalEmailService->DispatchOrderEmails($all_orders, $system_global_email);
    }
}
