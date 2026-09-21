<?php

namespace App\Console\Commands;

use App\Exceptions\IyzicoConnectionException;
use App\Jobs\PostOrderStockCheckJob;
use App\Models\OrderMaster;
use App\Services\IyzicoService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReconcilePendingIyzicoPayments extends Command
{
    protected $signature = 'payments:reconcile-iyzico {--hours=48} {--limit=100}';

    protected $description = 'Verify recent unresolved iyzico checkout payments and repair local payment state';

    public function __construct(private readonly IyzicoService $iyzicoService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $hours = max(1, min(168, (int) $this->option('hours')));
        $limit = max(1, min(500, (int) $this->option('limit')));
        $counts = ['checked' => 0, 'paid' => 0, 'failed' => 0, 'deferred' => 0];

        $masters = OrderMaster::query()
            ->where('created_at', '>=', now()->subHours($hours))
            ->where('payment_gateway', 'iyzico')
            ->where('payment_status', 'pending')
            ->whereNull('iyzico_payment_id')
            ->whereNotNull('transaction_ref')
            ->where('transaction_ref', '!=', '')
            ->orderBy('id')
            ->limit($limit)
            ->get();

        foreach ($masters as $master) {
            $counts['checked']++;

            try {
                $result = $this->iyzicoService->retrieveCheckoutForm(
                    (string) $master->transaction_ref,
                    "reconcile_order_{$master->id}_" . time()
                );
            } catch (IyzicoConnectionException $e) {
                $counts['deferred']++;
                Log::warning('Iyzico scheduled reconciliation deferred', [
                    'order_master_id' => $master->id,
                    'message' => $e->getMessage(),
                ]);
                continue;
            } catch (\Throwable $e) {
                $counts['deferred']++;
                Log::error('Iyzico scheduled reconciliation exception', [
                    'order_master_id' => $master->id,
                    'message' => $e->getMessage(),
                ]);
                continue;
            }

            if ($result->getStatus() === 'success' && strtoupper((string) $result->getPaymentStatus()) === 'SUCCESS') {
                $transactionIds = [];
                foreach ((array) $result->getPaymentItems() as $item) {
                    $transactionId = method_exists($item, 'getPaymentTransactionId')
                        ? $item->getPaymentTransactionId()
                        : null;
                    if ($transactionId) {
                        $transactionIds[] = (string) $transactionId;
                    }
                }

                $recovered = DB::transaction(function () use ($master, $result, $transactionIds): bool {
                    $locked = OrderMaster::lockForUpdate()->find($master->id);
                    if (! $locked || $locked->payment_status === 'paid') {
                        return false;
                    }

                    $locked->payment_status = 'paid';
                    $locked->payment_gateway = 'iyzico';
                    $locked->transaction_ref = (string) ($result->getPaymentId() ?: $locked->transaction_ref);
                    $locked->paid_amount = (float) ($result->getPaidPrice() ?: $locked->order_amount);
                    $locked->iyzico_payment_id = (string) $result->getPaymentId();
                    if ($transactionIds !== []) {
                        $locked->iyzico_payment_items_json = json_encode($transactionIds);
                    }
                    $locked->save();
                    $locked->orders()->update(['payment_status' => 'paid']);

                    return true;
                });

                if ($recovered) {
                    $counts['paid']++;
                    PostOrderStockCheckJob::dispatch($master->id)->delay(now()->addMinutes(30));
                    Log::warning('Iyzico payment recovered by scheduled reconciliation', [
                        'order_master_id' => $master->id,
                        'payment_id' => $result->getPaymentId(),
                        'transaction_ids' => $transactionIds,
                    ]);
                }
                continue;
            }

            // A structured iyzico result is authoritative. Keep the provider's
            // message in logs while making a formerly pending local row final.
            if ($result->getStatus() !== null) {
                if ($master->payment_status !== 'failed') {
                    $master->payment_status = 'failed';
                    $master->save();
                }
                $counts['failed']++;
                Log::info('Iyzico payment confirmed failed by scheduled reconciliation', [
                    'order_master_id' => $master->id,
                    'status' => $result->getStatus(),
                    'payment_status' => $result->getPaymentStatus(),
                    'error_code' => $result->getErrorCode(),
                    'error_message' => $result->getErrorMessage(),
                ]);
            }
        }

        $this->table(['checked', 'paid', 'failed', 'deferred'], [[
            $counts['checked'],
            $counts['paid'],
            $counts['failed'],
            $counts['deferred'],
        ]]);

        return self::SUCCESS;
    }
}
