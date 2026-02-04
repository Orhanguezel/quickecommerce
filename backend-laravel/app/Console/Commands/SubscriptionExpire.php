<?php

namespace App\Console\Commands;

use App\Mail\DynamicEmail;
use App\Models\EmailTemplate;
use App\Models\Store;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Modules\Subscription\app\Models\StoreSubscription;

class SubscriptionExpire extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:expire';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Subscription expired';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        info("Subscription Expire Job running at ". now());

        $all_store_subscriptions = StoreSubscription::with('store.seller')
            ->where('status', 2)
            ->get();

        foreach ($all_store_subscriptions as $subscription) {
            $expiryDate = Carbon::parse($subscription->expiry_date);
            if ($expiryDate->isPast()) {

                // Send email to store if email exists
                $store = $subscription->store;
                if ($store && $store->email) {
                    // send mail and notification
                    $store_email = $store->email;

                    // subscription buy mail send
                    try {
                        $email_template_subscription_store = EmailTemplate::where('type', 'subscription-expired-store')
                            ->where('status', 1)
                            ->first();

                        //subject nad body
                        $store_subject = $email_template_subscription_store->subject;
                        $store_message = $email_template_subscription_store->body;
                        $seller_name = $store->seller?->full_name;
                        $store_name = $store->name;

                        $store_message = str_replace(["@seller_name", "@store_name", "@expiry_date"],
                            [
                                $seller_name,
                                $store_name,
                                $subscription->expire_date
                            ], $store_message);

                        // store
                        Mail::to($store_email)->send(new DynamicEmail($store_subject, (string) $store_message));
                    } catch (\Exception $th) {
                    }

                }
            }
        }

    }
}
