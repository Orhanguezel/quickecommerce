<?php

namespace App\Providers;

use App\Interfaces\DynamicFieldOptionInterface;
use App\Interfaces\InventoryManageInterface;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Observers\CustomerObserver;
use App\Observers\OrderObserver;
use App\Observers\SellerStoreWiseObserver;
use App\Observers\StoreObserver;
use App\Observers\UserObserver;
use App\Repositories\ProductInventoryManageRepository;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // FIX: bind() 2 arg alır (abstract, concrete). 3. arg hatalıydı.
        $this->app->bind(InventoryManageInterface::class, ProductInventoryManageRepository::class);

        // Eğer DynamicFieldOptionInterface için bir repo/provider varsa burada ayrıca bind et.
        // Örnek:
        // $this->app->bind(DynamicFieldOptionInterface::class, DynamicFieldOptionRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load global constants (DEFAULT_LANGUAGE, etc.)
        require_once config_path('constants.php');

        // Observers
        User::observe(UserObserver::class);
        Customer::observe(CustomerObserver::class);
        Store::observe(SellerStoreWiseObserver::class);
        Store::observe(StoreObserver::class);
        Order::observe(OrderObserver::class);

        // Morph map
        Relation::morphMap([
            'customer'    => Customer::class,
            'admin'       => User::class,
            'deliveryman' => User::class,
            'store'       => Store::class,
        ]);

        // Defaults (never crash)
        $timezone = 'UTC';
        $globalCurrency = 'USD';

        if (file_exists(storage_path('installed'))) {
            $timezone = (string) (com_option_get('com_site_time_zone') ?? 'UTC');
            $globalCurrency = com_option_get('com_site_global_currency', config('app.default_currency'));
        }

        // Normalize common alias/typo
        if ($timezone === 'Africa/Asmera') {
            $timezone = 'Africa/Asmara';
        }

        // Validate timezone; NEVER crash artisan/app
        if (!in_array($timezone, timezone_identifiers_list(), true)) {
            $timezone = (string) (config('app.timezone') ?: 'UTC');
            if (!in_array($timezone, timezone_identifiers_list(), true)) {
                $timezone = 'UTC';
            }
        }

        config(['app.timezone' => $timezone]);
        date_default_timezone_set($timezone);

        config(['app.default_currency' => $globalCurrency]);
    }
}
