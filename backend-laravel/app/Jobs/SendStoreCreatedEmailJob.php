<?php

namespace App\Jobs;

use App\Mail\StoreCreatedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendStoreCreatedEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public $store;

    /**
     * Create a new job instance.
     */
    public function __construct($store)
    {
        $this->store = $store;
    }

    /**
     * Execute the job.
     */
    public function build()
    {
        Mail::to($this->store->email)->send(new StoreCreatedMail($this->store));
    }
}
