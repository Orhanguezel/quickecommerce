<?php

namespace App\Repositories;

use App\Models\Store;
use App\Models\User;
use App\Http\Resources\Seller\SellerStoreDetailsResource;
use App\Interfaces\StoreManageInterface;
use App\Jobs\SendDynamicEmailJob;
use App\Models\Banner;
use App\Models\EmailTemplate;
use App\Models\FlashSaleProduct;
use App\Models\Media;
use App\Models\ProductVariant;
use App\Models\DeliveryMan;
use App\Models\Order;
use App\Models\Product;
use App\Models\Translation;
use App\Services\MediaService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Modules\Subscription\app\Models\StoreSubscription;
use Modules\Subscription\app\Models\Subscription;
use Modules\Subscription\app\Models\SubscriptionHistory;
use function PHPUnit\Framework\isEmpty;

class StoreManageRepository implements StoreManageInterface
{
    public function __construct(protected Store $store, protected Translation $translation)
    {
    }

    public function translationKeys(): mixed
    {
        return $this->store->translationKeys;
    }

    public function model(): string
    {
        return Store::class;
    }

    public function getAllStores(
        int|string      $limit,
        int|string|null $status,
        int             $page,
        string          $language,
        string          $search,
        string          $sortField,
        string          $sort,
        array           $filters
    )
    {
        $store = Store::query()
            ->leftJoin('translations as name_translations', function ($join) use ($language) {
                $join->on('stores.id', '=', 'name_translations.translatable_id')
                    ->where('name_translations.translatable_type', '=', Store::class)
                    ->where('name_translations.language', '=', $language)
                    ->where('name_translations.key', '=', 'name');
            })
            ->select(
                'stores.*',
                DB::raw('COALESCE(name_translations.value, stores.name) as name')
            );

        //  Filter by search
        if (!empty($search)) {
            $store->where(function ($query) use ($search) {
                $query->where(DB::raw("COALESCE(name_translations.value, stores.name)"), 'like', "%{$search}%");
            });
        }


        if (is_numeric($status)) {
            $store->where('stores.status', (int)$status);
        }


        return $store->with(['seller', 'area', 'related_translations'])
            ->orderBy($sortField ?: 'stores.created_at', $sort ?: 'asc')
            ->paginate($limit);
    }


    public function getAuthSellerStores(int|string $limit, int $page, string $language, string $search, string $sortField, string $sort, array $filters)
    {
        $store = Store::leftJoin('translations as name_translations', function ($join) use ($language) {
            $join->on('stores.id', '=', 'name_translations.translatable_id')
                ->where('name_translations.translatable_type', '=', Store::class)
                ->where('name_translations.language', '=', $language)
                ->where('name_translations.key', '=', 'name');
        })->select(
            'stores.*',
            DB::raw('COALESCE(name_translations.value, stores.name) as name'),
        );

        // Apply search filter if search parameter exists
        if ($search) {
            $store->where(function ($query) use ($search) {
                $query->where(DB::raw("CONCAT_WS(' ', stores.name, name_translations.value)"), 'like', "%{$search}%");
            });
        }
        // Apply sorting and pagination
        // Return the result
        return $store
            ->where('deleted_at', null)
            ->where('store_seller_id', auth('api')->id())
            ->orderBy($sortField, $sort)
            ->paginate($limit);
    }

    public function storeForAuthSeller(array $data)
    {
        try {
            $data = Arr::except($data, ['translations']);
            $data['store_seller_id'] = auth('api')->id();
            $store = Store::create($data);

            // modified media for this store
            $user_id = $store->id;
            $user_type = Store::class;

            // If logo media exists, update its relation
            if (!empty($store->logo)) {
                $logoMedia = Media::find($store->logo);
                if ($logoMedia) {
                    $logoMedia->update([
                        'user_id' => $user_id,
                        'user_type' => $user_type,
                        'usage_type' => 'store_logo',
                    ]);
                }
            }

            // If banner media exists, update its relation
            if (!empty($store->banner)) {
                $bannerMedia = Media::find($store->banner);
                if ($bannerMedia) {
                    $bannerMedia->update([
                        'user_id' => $user_id,
                        'user_type' => $user_type,
                        'usage_type' => 'store_banner',
                    ]);
                }
            }

            // If meta_image exists, update
            if (!empty($store->meta_image)) {
                $metaImageMedia = Media::find($store->meta_image);
                if ($metaImageMedia) {
                    $metaImageMedia->update([
                        'user_id' => $user_id,
                        'user_type' => $user_type,
                        'usage_type' => 'store_meta_image',
                    ]);
                }
            }

            // if seller select store business type commission or subscription
            if (isset($data['subscription_type']) && !empty($data['subscription_type'])) {
                // create store wise subscription history
                // Validate subscription package
                $subscription_package = Subscription::where('id', $data['subscription_id'])
                    ->where('status', 1)
                    ->first();

                // Create subscription history
                SubscriptionHistory::create([
                    'store_id' => $store->id,
                    'subscription_id' => $subscription_package->id,
                    'name' => $subscription_package->name,
                    'validity' => $subscription_package->validity,
                    'price' => $subscription_package->price,
                    'pos_system' => $subscription_package->pos_system,
                    'self_delivery' => $subscription_package->self_delivery,
                    'mobile_app' => $subscription_package->mobile_app,
                    'live_chat' => $subscription_package->live_chat,
                    'order_limit' => $subscription_package->order_limit,
                    'product_limit' => $subscription_package->product_limit,
                    'product_featured_limit' => $subscription_package->product_featured_limit,
                    'payment_gateway' => $data['payment_gateway'],
                    'payment_status' => $data['payment_status'],
                    'transaction_ref' => $data['transaction_ref'],
                    'manual_image' => $data['manual_image'],
                    'expire_date' => now()->addDays($subscription_package->validity),
                    'status' => 0,
                ]);

                // Create store wise subscription
                StoreSubscription::create([
                    'store_id' => $store->id,
                    'subscription_id' => $subscription_package->id,
                    'name' => $subscription_package->name,
                    'validity' => $subscription_package->validity,
                    'price' => $subscription_package->price,
                    'pos_system' => $subscription_package->pos_system,
                    'self_delivery' => $subscription_package->self_delivery,
                    'mobile_app' => $subscription_package->mobile_app,
                    'live_chat' => $subscription_package->live_chat,
                    'order_limit' => $subscription_package->order_limit,
                    'product_limit' => $subscription_package->product_limit,
                    'product_featured_limit' => $subscription_package->product_featured_limit,
                    'payment_gateway' => $data['payment_gateway'],
                    'payment_status' => $data['payment_status'],
                    'transaction_ref' => $data['transaction_ref'],
                    'manual_image' => $data['manual_image'],
                    'expire_date' => now()->addDays($subscription_package->validity),
                    'status' => 0,
                ]);
            }

            return $store->id;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function store(array $data)
    {
        $data['created_by'] = auth('api')->id();
        try {
            $data = Arr::except($data, ['translations']);
            $store = Store::create($data);

            $seller = User::find($store->store_seller_id);

            // modified media for this store
            $user_id = $store->id;
            $user_type = Store::class;

            // If logo media exists, update its relation
            if (!empty($store->logo)) {
                $logoMedia = Media::find($store->logo);
                if ($logoMedia) {
                    $logoMedia->update([
                        'user_id' => $user_id,
                        'user_type' => $user_type,
                        'usage_type' => 'store_logo',
                    ]);
                }
            }

            // If banner media exists, update its relation
            if (!empty($store->banner)) {
                $bannerMedia = Media::find($store->banner);
                if ($bannerMedia) {
                    $bannerMedia->update([
                        'user_id' => $user_id,
                        'user_type' => $user_type,
                        'usage_type' => 'store_banner',
                    ]);
                }
            }

            // If meta_image exists, update
            if (!empty($store->meta_image)) {
                $metaImageMedia = Media::find($store->meta_image);
                if ($metaImageMedia) {
                    $metaImageMedia->update([
                        'user_id' => $user_id,
                        'user_type' => $user_type,
                        'usage_type' => 'store_meta_image',
                    ]);
                }
            }

            // Send email to seller register in background
            try {

                $seller_email = $seller->email;
                $seller_name = $seller->first_name . ' ' . $seller->last_name;
                $store_name = $store->name;
                // template
                $email_template_seller = EmailTemplate::where('type', 'store-creation')->where('status', 1)->first();
                // seller
                $seller_subject = $email_template_seller->subject;
                $seller_message = $email_template_seller->body;
                $seller_message = str_replace(["@seller_name", "@store_name"], [$seller_name, $store_name], $seller_message);

                // Check if template exists and email is valid and // Send the email using queued job
                if ($email_template_seller) {
                    // mail to seller
                    dispatch(new SendDynamicEmailJob($seller_email, $seller_subject, $seller_message));
                }
            } catch (\Exception $th) {
            }

            return $store->id;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getStoreById(int|string $id)
    {
        try {
            $store = Store::with(['related_translations', 'seller', 'area', 'activeSubscription'])->find($id);
            if ($store) {
                return response()->json(new SellerStoreDetailsResource($store));
            } else {
                return response()->json([
                    'message' => __('messages.data_not_found')
                ]);
            }
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function update(array $data)
    {
        $data['updated_by'] = auth('api')->id();
        try {
            $store = Store::findOrFail($data['id']);
            if ($store) {
                $data = Arr::except($data, ['translations']);
                $store->update($data);

                // If logo media exists, update its relation
                if (!empty($store->logo)) {
                    $logoMedia = Media::find($store->logo);
                    if ($logoMedia) {
                        $logoMedia->update([
                            'user_id' => $store->id,
                            'user_type' => Store::class,
                            'usage_type' => 'store_logo',
                        ]);
                    }
                }

                // If banner media exists, update its relation
                if (!empty($store->banner)) {
                    $bannerMedia = Media::find($store->banner);
                    if ($bannerMedia) {
                        $bannerMedia->update([
                            'user_id' => $store->id,
                            'user_type' => Store::class,
                            'usage_type' => 'store_banner',
                        ]);
                    }
                }

                // If meta_image exists, update
                if (!empty($store->meta_image)) {
                    $metaImageMedia = Media::find($store->meta_image);
                    if ($metaImageMedia) {
                        $metaImageMedia->update([
                            'user_id' => $store->id,
                            'user_type' => Store::class,
                            'usage_type' => 'store_meta_image',
                        ]);
                    }
                }

                return $store->id;
            } else {
                return false;
            }
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function updateForSeller(array $data)
    {
        try {
            $store = Store::findOrFail($data['id']);
            if ($store) {
                $data = Arr::except($data, ['translations']);
                $store->update($data);

                // modified media for this store
                $user_id = $store->id;
                $user_type = Store::class;

                // If logo media exists, update its relation
                if (!empty($store->logo)) {
                    $logoMedia = Media::find($store->logo);
                    if ($logoMedia) {
                        $logoMedia->update([
                            'user_id' => $user_id,
                            'user_type' => $user_type,
                            'usage_type' => 'store_logo',
                        ]);
                    }
                }

                // If banner media exists, update its relation
                if (!empty($store->banner)) {
                    $bannerMedia = Media::find($store->banner);
                    if ($bannerMedia) {
                        $bannerMedia->update([
                            'user_id' => $user_id,
                            'user_type' => $user_type,
                            'usage_type' => 'store_banner',
                        ]);
                    }
                }

                // If meta_image exists, update
                if (!empty($store->meta_image)) {
                    $metaImageMedia = Media::find($store->meta_image);
                    if ($metaImageMedia) {
                        $metaImageMedia->update([
                            'user_id' => $user_id,
                            'user_type' => $user_type,
                            'usage_type' => 'store_meta_image',
                        ]);
                    }
                }
                return $store->id;
            } else {
                return false;
            }
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function delete(int|string $id): bool
    {
        try {
            $store = Store::findOrFail($id);
            $this->deleteTranslation($store->id, Store::class);
            $this->deleteStoreRelatedProducts($store->id);

            $store_id = $store->id;

            // remove 	flash_sales
            FlashSaleProduct::where('store_id', $store_id)->delete();

            // remove store media
            $store_all_media = Media::where('user_id', $store_id)->where('user_type', Store::class)->get();
            foreach ($store_all_media as $media) {
                if ($media->path && Storage::exists($media->path)) {
                    Storage::delete($media->path);
                }
                $media->delete();
            }

            $store->delete();
        } catch (\Throwable $th) {
        }

        return true;
    }

    public function deleteStoresRelatedAllData(int|string $sellerId): bool
    {
        $seller = User::where('activity_scope', 'store_level')->where('store_owner', 1)->find($sellerId);
        if (!$seller) {
            return false;
        }

        $mediaIds = [];

        DB::transaction(function () use ($seller, &$mediaIds) {
            $stores = Store::where('store_seller_id', $seller->id)->get();

            foreach ($stores as $store) {
                // Collect store media
                if ($store->logo) {
                    $mediaIds[] = $store->logo;
                }
                if ($store->banner) {
                    $mediaIds[] = $store->banner;
                }

                $store->related_translations()->delete();

                // Product-related deletions
                $store->products()->each(function ($product) use (&$mediaIds) {
                    // Collect product images
                    if ($product->image) {
                        $mediaIds[] = $product->image;
                    }
                    if ($product->meta_image) {
                        $mediaIds[] = $product->meta_image;
                    }

                    // Collect variant images
                    $product->variants->each(function ($variant) use (&$mediaIds) {
                        if ($variant->image) {
                            $mediaIds[] = $variant->image;
                        }
                    });

                    // Delete related records
                    $product->flashSaleProduct()?->delete();
                    $product->related_translations()->delete();
                    $product->variants()->delete();
                    $product->reviews()->delete();
                    $product->wishlists()->delete();
                    $product->queries()->delete();
                    $product->delete();
                });

                // Chat-related
                $store->chats()->each(function ($chat) {
                    $chat->messages()->delete();
                    $chat->delete();
                });

                // Ticket-related
                $store->tickets()->each(function ($ticket) {
                    $ticket->messages()->delete();
                    $ticket->delete();
                });

                // Notices
                $store->notices()->each(function ($storeNotice) {
                    $storeNotice->notice()?->delete();
                    $storeNotice->delete();
                });

                $store->notifications()->delete();
                $store->subscriptions()->update(['status' => 0]);
            }
        });

        // After transaction, delete all collected media files
        if (!empty($mediaIds)) {
            $mediaService = app(MediaService::class);
            $mediaService->bulkDeleteMediaImages($mediaIds);
        }

        return true;
    }


    public function deleteSellerRelatedAllData(int|string $id): bool
    {
        $seller = User::where('activity_scope', 'store_level')->where('store_owner', 1)->find($id);
        if (!$seller) {
            return false;
        }

        $mediaIds = [];

        DB::transaction(function () use ($seller, &$mediaIds) {
            // Collect seller's image
            if ($seller->image) {
                $mediaIds[] = $seller->image;
            }

            // Collect staff media IDs
            $staffs = User::where('store_seller_id', $seller->id)->get();
            foreach ($staffs as $staff) {
                if ($staff->image) {
                    $mediaIds[] = $staff->image;
                }
            }

            // Collect author media IDs
            $seller->authors->each(function ($author) use (&$mediaIds) {
                if ($author->profile_image) {
                    $mediaIds[] = $author->profile_image;
                }
                if ($author->cover_image) {
                    $mediaIds[] = $author->cover_image;
                }
            });

            // Delete all store-related data (also collects media inside)
            $this->deleteStoresRelatedAllData($seller->id);

            // Delete authors and attributes
            $seller->authors()->delete();
            $seller->attributes()->delete();

            // Delete staff
            $staffs->each->delete();

            // Delete seller
            $seller->delete();
        });

        // Delete all collected media files
        if (!empty($mediaIds)) {
            $mediaService = app(MediaService::class);
            $mediaService->bulkDeleteMediaImages($mediaIds);
        }

        return true;
    }

    private function deleteStoreRelatedProducts(int $storeId): bool
    {
        $productIds = Product::where('store_id', $storeId)->pluck('id');

        if ($productIds->isNotEmpty()) {
            ProductVariant::whereIn('product_id', $productIds)->delete();
            Product::whereIn('id', $productIds)->delete();
        }

        return true;
    }

    private function deleteTranslation(int|string $id, string $translatableType): bool
    {
        Translation::where('translatable_id', $id)
            ->where('translatable_type', $translatableType)
            ->delete();

        return true;
    }

    public function storeTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        $translations = [];
        if ($request['translations']) {
            foreach ($request['translations'] as $translation) {
                foreach ($colNames as $key) {

                    // Fallback value if translation key does not exist
                    $translatedValue = $translation[$key] ?? null;

                    // Skip translation if the value is NULL
                    if ($translatedValue === null) {
                        continue; // Skip this field if it's NULL
                    }
                    // Collect translation data
                    $translations[] = [
                        'translatable_type' => $refPath,
                        'translatable_id' => $refid,
                        'language' => $translation['language_code'],
                        'key' => $key,
                        'value' => $translatedValue,
                    ];
                }
            }
        }
        if (count($translations)) {
            $this->translation->insert($translations);
        }
        return true;
    }

    public function updateTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        $translations = [];
        if ($request['translations']) {
            foreach ($request['translations'] as $translation) {
                foreach ($colNames as $key) {

                    // Fallback value if translation key does not exist
                    $translatedValue = $translation[$key] ?? null;

                    // Skip translation if the value is NULL
                    if ($translatedValue === null) {
                        continue; // Skip this field if it's NULL
                    }

                    $trans = $this->translation->where('translatable_type', $refPath)->where('translatable_id', $refid)
                        ->where('language', $translation['language_code'])->where('key', $key)->first();
                    if ($trans != null) {
                        $trans->value = $translatedValue;
                        $trans->save();
                    } else {
                        $translations[] = [
                            'translatable_type' => $refPath,
                            'translatable_id' => $refid,
                            'language' => $translation['language_code'],
                            'key' => $key,
                            'value' => $translatedValue,
                        ];
                    }
                }
            }
        }
        if (count($translations)) {
            $this->translation->insert($translations);
        }
        return true;
    }

    public function records(bool $onlyDeleted = false)
    {
        try {
            switch ($onlyDeleted) {
                case true:
                    $records = Store::onlyTrashed()->get();
                    break;

                default:
                    $records = Store::withTrashed()->get();
                    break;
            }
            return $records;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getOwnerStores()
    {
        if (!auth('api')->check()) {
            unauthorized_response();
        }

        $seller = auth('api')->user();

        if ($seller->store_owner == 0) {
            // Check if stores is a string (assuming it's JSON encoded if a string)
            if (is_string($seller->stores)) {
                // Decode the JSON string to an array
                $storeIds = json_decode($seller->stores, true);
            } else {
                // If it's already an array, use it directly
                $storeIds = $seller->stores;
            }

            // If the stores data exists and is not empty, proceed with the query
            if (!empty($storeIds)) {
                $stores = Store::with('related_translations') // Load all related translations
                ->whereIn('id', $storeIds)
                    ->get();
            } else {
                $stores = collect(); // Return an empty collection if no stores exist
            }
        } else {
            // Fetch the stores for the seller when store_owner is 1
            $stores = Store::with('related_translations') // Load all related translations
            ->where('store_seller_id', $seller->id)
                ->get();
        }

        return $stores;
    }

    public function checkStoreBelongsToSeller(string $slug)
    {
        // Ensure the user is authenticated
        if (!auth('api')->check()) {
            return unauthorized_response(); // Make sure the response is returned
        }

        $seller = auth('api')->user();

        // Check if the seller is a store owner or not
        if ($seller->store_owner == 0) {
            $storeIds = $this->getSellerStores($seller);

            // If no stores are found, return an empty collection
            if ($storeIds->isEmpty()) {
                return response()->json([
                    'status' => false,
                    'status_code' => 404,
                    'message' => __('messages.store.not.found')
                ]);
            }

            // Fetch the store based on slug
            return $this->getStoreBySlug($slug, $storeIds);
        }

        // If the seller owns the store directly, check for a match
        return $this->getStoreBySellerAndSlug($seller->id, $slug);
    }

    private function getSellerStores($seller)
    {
        // Decode JSON if stores are stored as a string, otherwise use the array directly
        return collect(is_string($seller->stores) ? json_decode($seller->stores, true) : $seller->stores);
    }

    private function getStoreBySlug($slug, $storeIds)
    {
        // Fetch stores where the slug exists in the list of store IDs
        $storeSlugCollection = Store::whereIn('id', $storeIds)->pluck('slug');

        // Check if the store slug exists in the seller's stores
        if ($storeSlugCollection->contains($slug)) {
            return Store::with(['seller'])->where('slug', $slug)->first();
        }

        return response()->json([
            'status' => false,
            'status_code' => 404,
            'message' => __('messages.store.not.found')
        ]);
    }

    private function getStoreBySellerAndSlug($sellerId, $slug)
    {
        // Fetch the store directly by seller ID and slug
        $store = Store::with(['seller'])
            ->where('store_seller_id', $sellerId)
            ->where('slug', $slug)
            ->first();

        // If the store is found, return it; otherwise, return an error message
        if ($store) {
            return $store;
        }

        return response()->json([
            'status' => false,
            'status_code' => 401,
            'message' => __('messages.store.doesnt.belongs.to.seller')
        ]);
    }

    public function getSummaryData(?string $slug = null, ?int $seller_id = null)
    {
        if ($seller_id) {
            $seller = User::where('id', $seller_id)->first();
            $user = $seller;
        } else {
            $user = auth('api')->user();
        }
        $summary = [
            'store_details' => [],
            'total_earnings' => 0,
            'total_additional_charge_earnings' => 0,
            'total_refunds' => 0,
            'total_stores' => 0,
            'total_product' => 0,
            'total_order' => 0,
            'total_stuff' => 0,
            'confirmed_orders' => 0,
            'pending_orders' => 0,
            'processing_orders' => 0,
            'shipped_orders' => 0,
            'completed_orders' => 0,
            'cancelled_orders' => 0,
            'deliveryman_not_assigned_orders' => 0,
            'refunded_orders' => 0,
            'total_pos_order_amount' => 0,
            'pos_orders' => 0,
        ];
        if ($slug) {
            // Fetch data for a specific store
            if ($user->store_owner == 0) {
                $stores = Store::with('related_translations')->where('slug', $slug)->get();
            } else {
                $stores = Store::with('related_translations')->where('slug', $slug)->where('store_seller_id', $user->id)->get();
            }
            $summary['store_details'] = $stores;
        } else {
            // Fetch data for all stores of the seller
            $stores = Store::where('store_seller_id', $user->id)->get();
        }
        foreach ($stores as $store) {
            // pos orders
            $summary['total_pos_order_amount'] += Order::where('store_id', $store->id)
                ->whereHas('orderMaster', function ($query) {
                    $query->where('payment_status', 'paid');
                })
                ->whereNull('refund_status')
                ->where('order_type', 'pos')
                ->sum('order_amount_store_value');


            $summary['total_earnings'] += Order::where('store_id', $store->id)
                ->whereHas('orderMaster', function ($query) {
                    $query->where('payment_status', 'paid');
                })
                ->whereNull('refund_status')
                ->where('order_type', 'regular')
                ->sum('order_amount_store_value');

            $summary['total_additional_charge_earnings'] += Order::where('store_id', $store->id)
                ->whereHas('orderMaster', function ($query) {
                    $query->where('payment_status', 'paid');
                })
                ->whereNull('refund_status')
                ->sum('order_additional_charge_store_amount');
            $summary['total_refunds'] += Order::where('store_id', $store->id)
                ->where('refund_status', 'refunded')
                ->sum('order_amount');
            $summary['total_stores'] += Store::where('id', $store->id)->count();
            $summary['total_product'] += Product::where('store_id', $store->id)->count();
            $summary['total_order'] += Order::where('store_id', $store->id)->count();
            $summary['total_stuff'] += User::where('activity_scope', 'store_level')
                ->where('store_owner', 0)
                ->whereNull('store_seller_id')
                ->whereJsonContains('stores', $store->id)
                ->count();
            $summary['confirmed_orders'] += Order::where('status', 'confirmed')->where('store_id', $store->id)->count();
            $summary['pending_orders'] += Order::where('status', 'pending')->where('store_id', $store->id)->count();
            $summary['processing_orders'] += Order::where('status', 'processing')->where('store_id', $store->id)->count();
            $summary['shipped_orders'] += Order::where('status', 'shipped')->where('store_id', $store->id)->count();
            $summary['completed_orders'] += Order::where('status', 'delivered')->where('store_id', $store->id)->count();
            $summary['cancelled_orders'] += Order::where('status', 'cancelled')->where('store_id', $store->id)->count();
            $summary['deliveryman_not_assigned_orders'] += Order::where('status', 'processing')
                ->whereNull('confirmed_by')
                ->where('store_id', $store->id)
                ->count();

            $summary['refunded_orders'] += Order::where('refund_status', 'refunded')->where('store_id', $store->id)->count();
            $summary['pos_orders'] += Order::where('order_type', 'pos')->where('store_id', $store->id)->count();

        }
        return $summary;
    }

    public function getSalesSummaryData(array $filters, ?string $slug = null)
    {
        $user = auth('api')->user();
        // Get store IDs based on the provided slug or all stores for the seller
        if ($slug) {
            $store = Store::where('slug', $slug)->where('store_seller_id', $user->id)->first();

            if (!$store) {
                return collect([]); // Return empty collection if slug not valid
            }

            $storeIds = [$store->id];
        } else {
            $storeIds = Store::where('store_seller_id', $user->id)->pluck('id')->toArray();
        }

        $query = Order::whereIn('store_id', $storeIds);

        // Handle time period filter
        $startDate = $filters['start_date'];
        $endDate = $filters['end_date'];

        if (!empty($filters['time_period'])) {
            switch ($filters['time_period']) {
                case 'this_week':
                    $startDate = Carbon::now()->startOfWeek();
                    $endDate = Carbon::now()->endOfWeek();
                    break;
                case 'this_month':
                    $startDate = Carbon::now()->startOfMonth();
                    $endDate = Carbon::now()->endOfMonth();
                    break;
                case 'this_year':
                    $startDate = Carbon::now()->startOfYear();
                    $endDate = Carbon::now()->endOfYear();
                    break;
            }
        }

        // Apply date range filter if valid
        if ($startDate && $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        if ($query->get()->isEmpty()) {
            return [
                [
                    "date" => "",
                    "total_sales" => "",
                ]
            ];
        }
        // Return grouped sales summary for delivered orders
        return $query->where('status', 'delivered')
            ->selectRaw('DATE(created_at) as date, SUM(order_amount) as total_sales')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getOrderGrowthData(?string $slug = null)
    {
        $user = auth('api')->user();
        $year = Carbon::now()->year;

        // Get store(s) based on slug
        $storeIds = $slug
            ? Store::where('slug', $slug)->where('store_seller_id', $user->id)->pluck('id')->toArray()
            : Store::where('store_seller_id', $user->id)->pluck('id')->toArray();

        if (empty($storeIds)) {
            return array_fill(1, 12, 0); // Return all months with 0 if no store found
        }

        // Fetch order counts per month
        $monthlyData = Order::whereIn('store_id', $storeIds)
            ->whereYear('created_at', $year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total_orders')
            )
            ->pluck('total_orders', 'month');
        // Fill missing months with 0
        return collect(range(1, 12))->mapWithKeys(fn($month) => [$month => $monthlyData->get($month, 0)]);
    }

    public function getOtherSummaryData(?string $slug = null)
    {
        $topRatedProducts = $this->getTopRatedProducts($slug);
        $recentCompletedOrders = $this->getRecentCompletedOrders($slug);

        return [
            'top_rated_products' => $topRatedProducts,
            'recent_completed_orders' => $recentCompletedOrders,
        ];
    }

    public function getTopRatedProducts($slug = null)
    {
        $user = auth('api')->user();

        if ($slug) {
            $store = Store::where('slug', $slug)->where('store_seller_id', $user->id)->first();
            if (!$store) {
                return collect([]); // Return empty collection if store not found
            }
            $storeIds = [$store->id]; // Convert to array for whereIn
        } else {
            $storeIds = Store::where('store_seller_id', $user->id)->pluck('id')->toArray();
        }

        return Product::with(['variants', 'store'])
            ->whereIn('products.store_id', $storeIds)
            ->where('products.status', 'approved')
            ->whereNull('products.deleted_at')
            ->leftJoin('reviews', function ($join) {
                $join->on('products.id', '=', 'reviews.reviewable_id')
                    ->where('reviews.reviewable_type', '=', Product::class)
                    ->where('reviews.status', '=', 'approved');
            })
            ->select([
                'products.id',
                'products.name',
                'products.slug',
                'products.image',
                'products.store_id',
                'products.status',
                DB::raw('COALESCE(AVG(reviews.rating), 0) as avg_rating')
            ])
            ->groupBy([
                'products.id',
                'products.name',
                'products.slug',
                'products.image',
                'products.store_id',
                'products.status'
            ])
            ->orderByDesc('avg_rating')
            ->limit(5)
            ->get();
    }

    public function getRecentCompletedOrders($slug = null)
    {
        $user = auth('api')->user();

        if ($slug) {
            $store = Store::where('slug', $slug)->where('store_seller_id', $user->id)->first();
            if (!$store) {
                return collect([]); // Return empty collection if store not found
            }
            $storeIds = [$store->id];
        } else {
            $storeIds = Store::where('store_seller_id', $user->id)->pluck('id')->toArray();
        }

        return Order::with(['orderMaster.customer', 'orderDetail', 'orderMaster', 'store', 'deliveryman', 'orderMaster.shippingAddress'])
            ->whereIn('store_id', $storeIds)
            ->where('status', 'delivered')
            ->orderByDesc('delivery_completed_at')
            ->limit(5)
            ->get();
    }


    public function storeDashboard(string $slug)
    {
        $store = $this->checkStoreBelongsToSeller($slug);
        $store['products'] = $this->getStoreWiseProducts($store->id);
        $store['banners'] = $this->getStoreWiseBanners($store->id);
        $store['orders'] = $this->getStoreWiseOrders($store->id);
        $store['recent_orders'] = $this->getStoreWiseRecentOrders($store->id);
        $store['best_selling'] = $this->getBestSellingProduct($store->id);
        return $store;
    }

    private function storeWiseDeliveryman(int $storeId)
    {
        if ($storeId) {
            $totalDeliveryman = DeliveryMan::where('store_id', $storeId)->where('status', 'approved')->count();
            return $totalDeliveryman;
        } else {
            return [];
        }
    }

    private function getStoreWiseProducts(int $storeId)
    {
        if ($storeId) {
            $totalProductsCount = Product::where('store_id', $storeId)->count();
            $approvedProductsCount = Product::where('store_id', $storeId)->where('status', 'approved')->count();
            $pendingProductsCount = Product::where('store_id', $storeId)->where('status', 'pending')->count();
            $inactiveProductsCount = Product::where('store_id', $storeId)->where('status', 'inactive')->count();
            $suspendedProductsCount = Product::where('store_id', $storeId)->where('status', 'suspended')->count();
            return [
                'total' => $totalProductsCount,
                'approved' => $approvedProductsCount,
                'pending' => $pendingProductsCount,
                'inactive' => $inactiveProductsCount,
                'suspended' => $suspendedProductsCount,
            ];
        } else {
            return [];
        }

    }

    private function getBestSellingProduct(int $storeId)
    {
        return Product::where('store_id', $storeId)
            ->where('status', 'approved')
            ->where('deleted_at', null)
            ->orderByDesc('order_count')
            ->limit(5)
            ->get();
    }

    private function getStoreWiseOrders(int $storeId)
    {
        if ($storeId) {
            $totalOrders = Order::where('store_id', $storeId)->count();
            $pendingOrders = Order::where('store_id', $storeId)->where('status', 'pending')->count();
            return [
                'totalOrders' => $totalOrders,
                'pendingOrders' => $pendingOrders,
            ];
        } else {
            return [];
        }
    }

    private function getStoreWiseRecentOrders(int $storeId)
    {
        if ($storeId) {
            $recentOrders = Order::where('store_id', $storeId)->latest()->take(5)->get();
            return $recentOrders;
        } else {
            return [];
        }
    }

    private function getStoreWiseBanners(int $storeId)
    {
        return [
            'active' => Banner::where('store_id', $storeId)->where('status', 1)->count()
        ];
    }

    public function getSellerWiseStores(?int $sellerId, ?string $search)
    {
        $query = Store::query();

        if ($sellerId) {
            $query->where('store_seller_id', $sellerId);
        } else {
            $query->where('status', 1)->limit(50);
        }

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%');
        }

        return $query->orderBy('name')->get();
    }

    public function approveStores(array $ids)
    {
        try {
            $stores = Store::whereIn('id', $ids)
                ->whereNull('deleted_at')
                ->whereIn('status', [0, 2])
                ->get();

            if ($stores->isEmpty()) {
                return false;
            }

            foreach ($stores as $store) {
                $store->status = 1;
                $store->save();

                try {
                    $seller = User::find($store->store_seller_id);
                    if (!$seller) {
                        continue;
                    }

                    $email_template_seller = EmailTemplate::where('type', 'store-approved-seller')
                        ->where('status', 1)
                        ->first();

                    if ($email_template_seller) {
                        $seller_subject = $email_template_seller->subject;
                        $seller_message = str_replace(
                            ["@seller_name", "@store_name"],
                            [$seller->first_name . ' ' . $seller->last_name, $store->name],
                            $email_template_seller->body
                        );

                        dispatch(new SendDynamicEmailJob($seller->email, $seller_subject, $seller_message));
                    }
                } catch (\Exception $ex) {

                }
            }

            return true;
        } catch (\Exception $e) {

            return false;
        }
    }

    public function rejectStores(array $ids)
    {
        try {
            $stores = Store::whereIn('id', $ids)
                ->whereNull('deleted_at')
                ->get();

            if ($stores->isEmpty()) {
                return false;
            }

            foreach ($stores as $store) {
                $store->status = 3;
                $store->save();

                try {
                    $seller = User::find($store->store_seller_id);
                    if (!$seller) {
                        continue;
                    }

                    $email_template_seller = EmailTemplate::where('type', 'store-reject-seller')
                        ->where('status', 1)
                        ->first();

                    if ($email_template_seller) {
                        $seller_subject = $email_template_seller->subject;
                        $seller_message = str_replace(
                            ["@seller_name", "@store_name"],
                            [$seller->first_name . ' ' . $seller->last_name, $store->name],
                            $email_template_seller->body
                        );

                        dispatch(new SendDynamicEmailJob($seller->email, $seller_subject, $seller_message));
                    }
                } catch (\Exception $ex) {

                }
            }

            return true;
        } catch (\Exception $e) {

            return false;
        }
    }

    public function changeStatus(array $data)
    {
        try {
            $store = Store::where('id', $data['id'])
                ->where('deleted_at', null)
                ->update([
                    'status' => $data['status']
                ]);

            try {
                $store = Store::where('id', $data['id'])->where('deleted_at', null)->first();
                $seller = User::find($store->store_seller_id);
                $seller_email = $seller->email;
                $seller_name = $seller->first_name . ' ' . $seller->last_name;
                $store_name = $store->name;

                // status
                $store_status = '';
                if ($store->status === 0) {
                    $store_status = __('Pending');
                } elseif ($store->status === 1) {
                    $store_status = __('Active');
                } elseif ($store->status === 2) {
                    $store_status = __('Inactive');
                }

                $email_template_seller = EmailTemplate::where('type', 'store-status-change-seller')->where('status', 1)->first();

                if ($email_template_seller) {
                    $seller_subject = $email_template_seller->subject;
                    $seller_message = str_replace(
                        ["@seller_name", "@store_name", "@status"],
                        [$seller_name, $store_name, $store_status],
                        $email_template_seller->body
                    );

                    dispatch(new SendDynamicEmailJob($seller_email, $seller_subject, $seller_message));
                }
            } catch (\Exception $ex) {
            }

            return $store->count() > 0;
        } catch (\Exception $e) {
            return false;
        }
    }
}
