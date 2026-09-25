<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\OrderMaster;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Modules\Wallet\app\Models\Wallet;

class QuarantineTestCustomer extends Command
{
    protected $signature = 'commerce:quarantine-test-customer
        {email : Exact customer email address}
        {--delete-wallet : Delete this customer wallet and its transactions}
        {--apply : Persist changes; without this option the command is a dry run}';

    protected $description = 'Exclude an exact test customer from sales reporting and optionally remove only their test wallet';

    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->argument('email')));
        $customer = Customer::withTrashed()->whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $customer) {
            $this->error("Customer not found: {$email}");
            return self::FAILURE;
        }

        $orders = OrderMaster::query()->where('customer_id', $customer->id);
        $wallets = Wallet::withTrashed()
            ->where('owner_type', Customer::class)
            ->where('owner_id', $customer->id);

        $summary = [
            ['Customer', "#{$customer->id} {$customer->full_name} <{$customer->email}>"],
            ['Orders to mark as test', (string) (clone $orders)->where('is_test', false)->count()],
            ['Customer wallets', (string) (clone $wallets)->count()],
            ['Wallet transactions', (string) DB::table('wallet_transactions')
                ->whereIn('wallet_id', (clone $wallets)->pluck('id'))->count()],
            ['Wallet deletion requested', $this->option('delete-wallet') ? 'yes' : 'no'],
            ['Mode', $this->option('apply') ? 'APPLY' : 'DRY RUN'],
        ];
        $this->table(['Check', 'Value'], $summary);

        if (! $this->option('apply')) {
            $this->warn('No data changed. Add --apply after reviewing the exact customer above.');
            return self::SUCCESS;
        }

        DB::transaction(function () use ($orders, $wallets): void {
            $orders->update(['is_test' => true]);

            if ($this->option('delete-wallet')) {
                $walletIds = (clone $wallets)->pluck('id');
                DB::table('wallet_transactions')->whereIn('wallet_id', $walletIds)->delete();
                Wallet::withTrashed()->whereIn('id', $walletIds)->forceDelete();
            }
        });

        $this->info('Test data was quarantined successfully. The customer account itself was preserved.');
        return self::SUCCESS;
    }
}
