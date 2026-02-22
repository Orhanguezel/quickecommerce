<?php

use App\Models\Customer;
use App\Models\DeliveryMan;
use App\Models\Order;
use App\Models\SettingOption;
use App\Models\CouponLine;
use App\Models\Media;
use App\Models\Store;
use App\Models\Translation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Modules\Subscription\app\Models\StoreSubscription;


if (!function_exists('checkSubscription')) {
    function checkSubscription($storeId, $feature = null)
    {
        $store = Store::find($storeId);
        $store_subscription = StoreSubscription::where('store_id',$storeId)
            ->where('status', 1)
            ->where('payment_status', 'paid')
            ->first();

        if (!$store) {
            return false;
        }
        if ($store->subscription_type === 'commission' || $store->subscription_type === 'subscription') {
            if($store_subscription && $store_subscription->pos_system === 0){
                return false;
            }

            return true;
        }

        $subscriptionExists = StoreSubscription::where('store_id', $storeId)->exists();

        if (!$subscriptionExists) {
            return false;
        }
        $query = StoreSubscription::where('store_id', $storeId)
            ->where('status', 1)
            ->where('payment_status', 'paid');

        if ($feature !== null) {
            $query->where($feature, 1); // assuming 1 = enabled
        }

        return $query->exists();
    }
}

if (!function_exists('runningOrderExists')) {
    function runningOrderExists($storeId = null, $sellerId = null): bool
    {
        if (!$storeId && !$sellerId) {
            return false;
        }

        if ($storeId) {
            return Order::where('store_id', $storeId)
                ->whereNotIn('status', ['cancelled', 'delivered'])
                ->exists();
        }

        if ($sellerId) {
            $storeIds = \App\Models\Store::where('store_seller_id', $sellerId)->pluck('id');
            if ($storeIds->isEmpty()) {
                return false;
            }
            return Order::whereIn('store_id', $storeIds)
                ->whereNotIn('status', ['cancelled', 'delivered'])
                ->exists();
        }

        return false;
    }
}

if (!function_exists('shouldRound')) {
    function shouldRound(): bool
    {
        $setting = SettingOption::where('option_name', 'com_site_enable_disable_decimal_point')->first();
        return $setting && $setting->option_value === 'NO';
    }
}

if (!function_exists('socialLogin')) {
    function socialLogin(string $accessToken, string $type, string $firebaseToken = null, string $role)
    {
        $socialId = null;
        $name = null;
        $email = null;
        if ($type === 'google') {
            $data = verifyGoogleToken($accessToken);
            if (!$data) {
                return response()->json(['error' => 'invalid token']);
            }
            $socialId = $data['id'];
            $name = $data['name'];
            $email = $data['email'];
        } elseif ($type === 'facebook') {
            $data = verifyFacebookToken($accessToken);
            if (!$data) {
                return response()->json(['error' => 'invalid token']);
            }
            $socialId = $data['id'];
            $name = $data['name'];
            $email = $data['email'];
        } else {
            return response()->json([
                'message' => __('messages.invalid_token')
            ], 422);
        }
        $socialColumn = $type . '_id';
        if ($role === 'customer') {
            $user = Customer::where($socialColumn, $socialId)
                ->first();

            if (!$user) {
                $user = User::create([
                    'first_name' => $name,
                    'email' => $email,
                    'slug' => username_slug_generator($name),
                    $socialColumn => $socialId,
                    'email_verified' => 1,
                    'email_verified_at' => Carbon::now(),
                    'firebase_token' => $firebaseToken,
                    'password' => Hash::make(Str::random(8)), // Never use dummy passwords
                ]);
            } else {
                $user->update([
                    $socialColumn => $socialId,
                    'firebase_token' => $firebaseToken,
                ]);
            }
            // Create Sanctum token
            $token = $user->createToken('social_auth_token');
            $accessToken = $token->accessToken;
            $accessToken->expires_at = Carbon::now()->addMinutes((int)config('sanctum.expiration', 60));
            $accessToken->save();

            return response()->json([
                'success' => true,
                'message' => __('auth.social.login'),
                'token' => $token->plainTextToken,
                'expires_at' => $accessToken->expires_at->format('Y-m-d H:i:s'),
                'email_verified' => (bool)$user->email_verified,
                'account_status' => $user->deactivated_at ? 'deactivated' : 'active',
                'marketing_email' => (bool)$user->marketing_email,
                'activity_notification' => (bool)$user->activity_notification,
            ]);
        }

        if ($role === 'deliveryman') {
            $userButNotDeliveryman = User::where($socialColumn, $socialId)
                ->whereNot('activity_scope', 'delivery_level')
                ->first();
            $user = User::where($socialColumn, $socialId)
                ->where('activity_scope', 'delivery_level')
                ->first();
            if ($userButNotDeliveryman) {
                $user_role = match ($userButNotDeliveryman->activity_scope) {
                    'system_level' => 'Admin',
                    'store_level' => 'Seller',
                    'deliveryman' => 'Deliveryman',
                    'customer' => 'Customer',
                    default => 'user',
                };

                if ($userButNotDeliveryman) {
                    return response()->json([
                        'message' => __('messages.user_exists', ['name' => $user_role]),
                    ]);
                }
            }

            if (!$user) {
                $user = User::create([
                    'first_name' => $name,
                    'email' => $email,
                    'slug' => username_slug_generator($name),
                    $socialColumn => $socialId,
                    'firebase_token' => $firebaseToken,
                    'password' => Hash::make(Str::random(8)), // Never use dummy passwords
                    'activity_scope' => 'delivery_level',
                    'store_owner' => 0,
                    'status' => 0,
                    'email_verified' => 1,
                    'email_verified_at' => Carbon::now(),
                ]);
                $deliverymanDetails = Deliveryman::create([
                    'user_id' => $user->id,
                    'status' => 'pending',
                ]);
            } else {
                $user->update([
                    $socialColumn => $socialId,
                    'firebase_token' => $firebaseToken,
                ]);
            }

            // Create Sanctum token
            $token = $user->createToken('social_auth_token');
            $accessToken = $token->accessToken;
            $accessToken->expires_at = Carbon::now()->addMinutes((int)config('sanctum.expiration', 60));
            $accessToken->save();
            return response()->json([
                'success' => true,
                'message' => __('auth.social.login'),
                'token' => $token->plainTextToken,
                'expires_at' => $accessToken->expires_at->format('Y-m-d H:i:s'),
                "deliveryman_id" => $user->id,
                'email_verified' => (bool)$user->email_verified,
                'account_status' => $user->deactivated_at ? 'deactivated' : 'active',
                'marketing_email' => (bool)$user->marketing_email,
                'activity_notification' => (bool)$user->activity_notification,
            ]);
        }
    }
}
if (!function_exists('verifyFacebookToken')) {
    function verifyFacebookToken(string $accessToken)
    {
        $client = new \GuzzleHttp\Client();

        // Verify token & get user info
        $response = $client->get('https://graph.facebook.com/me', [
            'query' => [
                'access_token' => $accessToken,
                'fields' => 'id,name,email',
            ]
        ]);

        if ($response->getStatusCode() !== 200) {
            return null;
        }

        return json_decode($response->getBody(), true);
    }
}

if (!function_exists('verifyGoogleToken')) {
    function verifyGoogleToken(string $accessToken)
    {
        try {
            $client = new \GuzzleHttp\Client();

            $response = $client->get('https://www.googleapis.com/oauth2/v1/userinfo', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Accept' => 'application/json',
                ],
            ]);

            $userData = json_decode($response->getBody(), true);
            // Optional: check required fields
            if (!isset($userData['email']) || !isset($userData['id'])) {
                return null;
            }

            return $userData;

        } catch (\Exception $e) {
            return null;
        }
    }
}

if (!function_exists('remove_invalid_charcaters')) {
    function remove_invalid_charcaters($str)
    {
        return str_ireplace(['\'', '<', '>'], '"', ';', ' ', $str);
    }
}

if (!function_exists('translate')) {
    function translate($key, $replace = [])
    {
        $local = app()->getLocale();
        return trans($key, $replace);
    }
}

if (!function_exists('safeJsonDecode')) {
    function safeJsonDecode($value)
    {
        // Handle case where value is already a clean string
        if (is_null($value) || !is_string($value)) {
            return $value;
        }
        // Try decoding, but fallback if not a valid JSON
        $decoded = json_decode($value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }
}


if (!function_exists('createOrUpdateTranslationJson')) {
    function createOrUpdateTranslationJson(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {

        if (empty($request['translations'])) {
            return false;
        }

        $requestedLanguages = array_column($request['translations'], 'language_code');

        // Delete translations for languages not present in the request
        Translation::where('translatable_type', $refPath)
            ->where('translatable_id', $refid)
            ->whereNotIn('language', $requestedLanguages)
            ->delete();

        $translations = [];

        foreach ($request['translations'] as $translation) {

            foreach ($colNames as $key) {

                $translatedValue = $translation[$key] ?? null;

                if ($translatedValue === null) {
                    continue;
                }

                // Check if the translation already exists
                $trans = Translation::where('translatable_type', $refPath)
                    ->where('translatable_id', $refid)
                    ->where('language', $translation['language_code'])
                    ->where('key', $key)
                    ->first();

                if ($trans) {
                    $trans->value = $translatedValue;
                    $trans->save();
                } else {
                    $translations[] = [
                        'translatable_type' => $refPath,
                        'translatable_id' => $refid,
                        'language' => $translation['language_code'],
                        'key' => $key,
                        'value' => json_encode($translatedValue),
                    ];
                }
            }
        }

        // Bulk insert new translations
        if (!empty($translations)) {
            Translation::insert($translations);
        }

        return true;
    }
}


if (!function_exists('createOrUpdateTranslation')) {
    function createOrUpdateTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        if (empty($request['translations'])) {
            return false;
        }
        $requestedLanguages = array_column($request['translations'], 'language_code');
        // Delete translations for languages not present in the request
        Translation::where('translatable_type', $refPath)
            ->where('translatable_id', $refid)
            ->whereNotIn('language', $requestedLanguages)
            ->delete();
        $translations = [];
        foreach ($request['translations'] as $translation) {
            foreach ($colNames as $key) {
                $translatedValue = $translation[$key] ?? null;

                if ($translatedValue === null || $translatedValue === '') {
                    Translation::where('translatable_type', $refPath)
                        ->where('translatable_id', $refid)
                        ->where('language', $translation['language_code'])
                        ->where('key', $key)
                        ->delete();
                    continue;
                }

                // Check if the translation already exists
                $trans = Translation::where('translatable_type', $refPath)
                    ->where('translatable_id', $refid)
                    ->where('language', $translation['language_code'])
                    ->where('key', $key)
                    ->first();

                if ($trans) {
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
        // Bulk insert new translations
        if (!empty($translations)) {
            Translation::insert($translations);
        }

        return true;
    }
}


if (!function_exists('jsonImageModifierFormatter')) {
    function jsonImageModifierFormatter(array $data)
    {
        $imageModifier = new \App\Actions\MultipleImageModifier();
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                // Recursively process nested arrays
                $data[$key] = jsonImageModifierFormatter($value);
            } elseif (isImageKey($key)) {
                $data[$key] = $value;

                // Safe check for multiple image value
                if (is_string($value) && isMultipleImageValue($value)) {
                    $data[$key . '_urls'] = !empty($value)
                        ? $imageModifier->multipleImageModifier($value)
                        : [];
                }

                $data[$key . '_url'] = \App\Actions\ImageModifier::generateImageUrl($value);
            }
        }

        return $data;
    }
}

function isImageKey(string $key): bool
{
    $imageKeys = ['image_id','image', 'background_image', 'com_payment_methods_image']; // declare the fields that needed to be formatted
    return in_array($key, $imageKeys);
}

if (!function_exists('isMultipleImageValue')) {
    function isMultipleImageValue(string $value): bool
    {
        return is_string($value) && str_contains($value, ',') && !empty(trim($value));
    }
}

if (!function_exists('calculateCenterPoint')) {
    function calculateCenterPoint(array $coordinates)
    {
        if (empty($coordinates)) {
            return ['center_latitude' => null, 'center_longitude' => null];
        }

        $totalLat = 0;
        $totalLng = 0;
        $count = count($coordinates);

        foreach ($coordinates as $coordinate) {
            $totalLat += $coordinate['lat'];
            $totalLng += $coordinate['lng'];
        }

        return [
            'center_latitude' => $totalLat / $count,
            'center_longitude' => $totalLng / $count,
        ];
    }
}


if (!function_exists('generateRandomCouponCode')) {
    function generateRandomCouponCode()
    {
        $couponCode = strtoupper(Str::random(8));
        while (\App\Models\CouponLine::where('coupon_code', $couponCode)->exists()) {
            $couponCode = strtoupper(Str::random(8));
        }
        return $couponCode;
    }
}

if (!function_exists('generateVariantSlug')) {
    function generateVariantSlug(array $attributes): string
    {
        // Filter attributes to remove empty values
        $filteredAttributes = array_filter($attributes, fn($value) => !empty($value));

        // Sort attributes to ensure consistency in slug generation
        ksort($filteredAttributes);

        // Concatenate attribute values with a hyphen and convert to a slug
        return Str::slug(implode('-', $filteredAttributes));
    }
}

if (!function_exists('capitalize_first_letter')) {
    function capitalize_first_letter(string $value): string
    {
        return ucfirst(strtolower($value));
    }
}

if (!function_exists('slug_generator')) {
    function slug_generator(string $value, string $model, string $field = 'slug', ?int $id = null): string
    {
        $slug = Str::slug($value); // Generate initial slug
        $originalSlug = $slug;

        $i = 1;
        while ($model::where($field, $slug)->when($id, function ($query, $id) {
            return $query->where('id', '!=', $id);
        })->exists()) {
            $slug = "{$originalSlug}-{$i}";
            $i++;
        }
        return $slug;
    }
}

if (!function_exists('username_slug_generator')) {
    function username_slug_generator($first_name, $last_name = null)
    {
        // Generate the base username slug
        $username = Str::slug(trim(strtolower($first_name)));

        if ($last_name) {
            $slugLastName = Str::slug(trim(strtolower($last_name)));
            $username = "{$username}-{$slugLastName}";
        }

        $originalUsername = $username;
        $counter = 1;

        // Loop until a unique slug is found
        do {
            $exists = User::where('slug', $username)->exists();
            if ($exists) {
                $username = "{$originalUsername}-{$counter}";
                $counter++;
            }
        } while ($exists && $counter < 1000);

        // Fallback in case uniqueness is not achieved after many attempts
        if ($exists) {
            $username = "{$originalUsername}-" . Str::random(5);
        }

        return $username;
    }
}

if (!function_exists('generateUniqueSku')) {
    function generateUniqueSku($prefix = '', $length = 8)
    {
        do {
            // Generate a random SKU using a prefix and a random string
            $sku = strtoupper($prefix) . Str::random($length);

            // Check if the SKU already exists in the `product_variants` table
            $exists = DB::table('product_variants')->where('sku', $sku)->exists();
        } while ($exists); // Repeat until a unique SKU is found

        return $sku;
    }
}

if (!function_exists('unauthorized_response')) {
    function unauthorized_response(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'status' => false,
            'message' => 'Unauthorized access. Please log in.',
        ], 401);
    }
}

function formatBytes($size, $precision = 2)
{
    $base = log($size, 1024);
    $suffixes = array('', 'KB', 'MB', 'GB', 'TB');

    return round(pow(1024, $base - floor($base)), $precision) . ' ' . $suffixes[floor($base)];
}

function com_option_update($key, $value)
{
    $option = SettingOption::updateOrCreate(
        ['option_name' => $key],
        ['option_value' => $value]
    );
    // com_option_get() cache key'i "{$key}_{$locale}" formatında saklar,
    // ancak bu fonksiyon sadece $key ile siler — cache temizlenmiyor.
    // Desteklenen tüm locale varyantları için cache temizle.
    Cache::forget($key);
    $locales = config('app.available_locales', ['tr', 'en', 'de', 'fr', 'ar']);
    foreach ($locales as $locale) {
        Cache::forget("{$key}_{$locale}");
    }
    return $option ? true : false;
}

function com_option_get($key, $default = null, $cache = true)
{
    // If install file does not exist, return default directly
    if (!file_exists(storage_path('installed'))) {
        return $default;
    }

    $locale = app()->getLocale();
    $cacheKey = "{$key}_{$locale}";

    if ($cache) {
        $value = \Illuminate\Support\Facades\Cache::remember($cacheKey, 600, function () use ($key, $locale) {
            try {
                $option = SettingOption::where('option_name', $key)->first();
                if (!$option) return null;

                $translation = Translation::where('translatable_type', SettingOption::class)
                    ->where('translatable_id', $option->id)
                    ->where('language', $locale)
                    ->where('key', $key)
                    ->first();

                return $translation ? $translation->value : $option->option_value;
            } catch (\Exception $e) {
                return null;
            }
        });
    } else {
        try {
            $option = SettingOption::where('option_name', $key)->first();
            if (!$option) return $default;

            $translation = Translation::where('translatable_type', SettingOption::class)
                ->where('translatable_id', $option->id)
                ->where('language', $locale)
                ->where('key', $key)
                ->first();

            $value = $translation ? $translation->value : $option->option_value;
        } catch (\Exception $e) {
            $value = null;
        }
    }

    return $value ?? $default;
}




function com_get_footer_copyright()
{
    $copyright_text = com_option_get('com_site_footer_copyright');
    $copyright_text = str_replace(array('{copy}', '{year}'), array('&copy;', date('Y')), $copyright_text);
    return $copyright_text;
}

function com_option_get_id_wise_url($id, $size = null)
{
    // Support external URLs - if it starts with http:// or https://, return as-is
    if (is_string($id) && (str_starts_with($id, 'http://') || str_starts_with($id, 'https://'))) {
        return $id;
    }

    $return_val = com_get_attachment_by_id($id, $size);
    return $return_val['img_url'] ?? '';
}

function com_get_attachment_by_id($id, $size = null, $default = false)
{
    // Support external URLs - if it starts with http:// or https://, return URL info directly
    if (is_string($id) && (str_starts_with($id, 'http://') || str_starts_with($id, 'https://'))) {
        return [
            'image_id' => null,
            'img_url' => $id,
            'img_path' => $id,
        ];
    }

    $image_details = Media::find($id);
    $return_val = [];
    $image_url = '';

    if ($image_details) {
        // Construct the base path for the images
        $base_path = 'storage' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'media-uploader' . DIRECTORY_SEPARATOR . 'default';
        $image_path = $base_path . DIRECTORY_SEPARATOR . $image_details->path;
        $image_path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $image_path); // Normalize path separators

        $image_url = asset("storage/{$image_details->path}");
        // Check if the grid version exists (without file_exists, use URL generation)
        $grid_image_url = asset("storage/uploads/media-uploader/default/" . basename($image_details->path));

        // If the grid version URL is valid, use that
        if ($grid_image_url) {
            $image_url = $grid_image_url;
        }

        if (file_exists(public_path($image_path))) {
            $image_url = asset($image_path);
        }

        // Handle image variations based on size
        $size_prefixes = [
            'large' => 'large-',
            'grid' => 'grid-',
            'semi-large' => 'semi-large-',
            'thumb' => 'thumb-',
        ];

        if ($size && array_key_exists($size, $size_prefixes)) {
            $sized_image_path = $base_path . DIRECTORY_SEPARATOR . $size_prefixes[$size] . $image_details->path;
            $sized_image_path = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $sized_image_path); // Normalize path separators

            if (file_exists(public_path($sized_image_path))) {
                $image_url = asset($sized_image_path);
            }
        }

        // Set the return values
        $return_val['image_id'] = $image_details->id;
        $return_val['path'] = $image_details->path;
        $return_val['img_url'] = $image_url;
        $return_val['img_alt'] = $image_details->alt;
    } elseif ($default) {
        // Set a default image URL if the image is not found
        $return_val['img_url'] = asset('storage' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'no-image.png');
    }

    return $return_val;
}

function updateEnvValues(array $get_data)
{
    $env_data_file = app()->environmentFilePath();
    $string_data = file_get_contents($env_data_file);
    if (count($get_data) > 0) {
        foreach ($get_data as $envKey => $envValue) {
            $string_data .= "\n";
            $keyPosition = strpos($string_data, "{$envKey}=");
            $position_end_line = strpos($string_data, "\n", $keyPosition);
            $line_old_value = substr($string_data, $keyPosition, $position_end_line - $keyPosition);
            if (!$keyPosition || !$position_end_line || !$line_old_value) {
                $string_data .= "{$envKey}={$envValue}\n";
            } else {
                $string_data = str_replace($line_old_value, "{$envKey}={$envValue}", $string_data);
            }
        }
    }
    $string_data = substr($string_data, 0, -1);

    if (!file_put_contents($env_data_file, $string_data)) return false;
    return true;
}

function moduleExists($name)
{
    $module_status = json_decode(file_get_contents(__DIR__ . '/../../modules_statuses.json'));
    $folderPath = base_path('./Modules' . DIRECTORY_SEPARATOR . $name);
    if (file_exists($folderPath) && is_dir($folderPath)) {
        return property_exists($module_status, $name) ? $module_status->$name : false;
    }
    return false;
}

function moduleExistsAndStatus($name)
{
    $module_status = json_decode(file_get_contents(__DIR__ . '/../../modules_statuses.json'));
    $folderPath = base_path('./Modules' . DIRECTORY_SEPARATOR . $name);
    if (file_exists($folderPath) && is_dir($folderPath)) {
        return property_exists($module_status, $name) ? $module_status->$name : false;
    }
    return false;
}


// coupon manage
function applyCoupon(string $couponCode, float $orderAmount): array
{
    $coupon = CouponLine::with('coupon')->where('coupon_code', $couponCode)->first();

    if (!$coupon) {
        return [
            'success' => false,
            'message' => 'Coupon not found.',
        ];
    }

    if ($coupon->expires_at && $coupon->expires_at->isPast()) {
        return [
            'success' => false,
            'message' => 'Coupon has expired.',
        ];
    }

    if ($coupon->usage_limit == 0) {
        return [
            'success' => false,
            'message' => 'Coupon usage limit reached.',
        ];
    }

    if ($orderAmount < $coupon->min_order_value) {
        return [
            'success' => false,
            'message' => __('messages.coupon_min_order_amount', ['amount' => $coupon->min_order_value]),
        ];
    }

    $discountAmount = 0;

    if ($coupon->discount_type === 'percentage') {
        $discountAmount = ($orderAmount / 100) * $coupon->discount;
    } elseif ($coupon->discount_type === 'amount') {
        $discountAmount = $coupon->discount;
    } else {
        return [
            'success' => false,
            'message' => __('messages.something_wrong'),
        ];
    }

    // Apply max discount limit
    $discountAmount = min($discountAmount, $coupon->max_discount ?? $discountAmount);

    // Ensure the discount does not exceed the order total
    $discountAmount = min($discountAmount, $orderAmount);
    $finalOrderAmount = $orderAmount - $discountAmount;

    // Update usage stats (optional, could also be deferred until after order success)
    $coupon->increment('usage_count');
    if ($coupon->usage_limit) {
        $coupon->decrement('usage_limit');
    }

    return [
        'success' => true,
        'discount_amount' => round($discountAmount, 2),
        'final_order_amount' => round($finalOrderAmount, 2),
        'coupon_type' => $coupon->discount_type,
        'discount_rate' => $coupon->discount,
        'coupon_title' => $coupon->coupon->title ?? null,
        'coupon_code' => $coupon->coupon_code,
    ];
}

if (!function_exists('checkCoupon')) {
    function checkCoupon($couponCode, $subTotal)
    {
        // Retrieve the coupon by the provided coupon code
        $coupon = CouponLine::where('coupon_code', $couponCode)->first();
        // Handle the case where the coupon is not found
        if (!$coupon) {
            return [];
        }
        // Check if the coupon is restricted to a specific customer
        if ($coupon->customer_id !== null) {
            // If the coupon is tied to a specific customer, ensure the authenticated user is the same
            if (!auth('api_customer')->check()) {
                return [];
            }

            // Check if the coupon is assigned to a specific customer and ensure it matches the authenticated customer
            if ($coupon->customer_id && $coupon->customer_id !== auth('api_customer')->id()) {
                return [];
            }
        }

        // Check if the coupon is active based on the start and end dates
        if ($coupon->start_date && $coupon->start_date > now()) {
            return [];
        }

        if ($coupon->end_date && $coupon->end_date < now()) {
            return [];
        }

        // Check if the coupon usage limit has been reached
        if ($coupon->usage_limit == 0) {
            return [];
        }
        if ($coupon->coupon->status != 1 && $coupon->status != 1) {
            return [];
        }
        // check min_order status
        if ($subTotal < $coupon->min_order_value) {
            return [];
        }
        $sub_total = $subTotal;
        $final_amount_after_removing_coupon_discount = 0;
        $discount_amount = 0;
        if ($coupon->discount_type == 'percentage') {
            $discount_amount = $sub_total / 100 * $coupon->discount;
            $final_amount_after_removing_coupon_discount = $sub_total - $discount_amount;
        } elseif ($coupon->discount_type == 'amount') {
            $discount_amount = $coupon->discount;
            $final_amount_after_removing_coupon_discount = $sub_total - $discount_amount;
        } else {
            return [];
        }
        // check max discount amount
        if ($discount_amount > $coupon->max_discount) {
            $discount_amount = $coupon->max_discount;
            $final_amount_after_removing_coupon_discount = $sub_total - $discount_amount;
        }
        // If all checks pass, return the coupon's discount details
        return [
            'title' => $coupon->coupon->title,
            'discount_amount' => $coupon->discount,
            'max_discount' => $coupon->max_discount,
            'min_order_value' => $coupon->min_order_value,
            'discount_type' => $coupon->discount_type,
            'code' => $coupon->coupon_code,
            'discounted_amount' => $discount_amount,
            'final_amount' => $final_amount_after_removing_coupon_discount,
        ];

    }
}


if (!function_exists('getOrderStatusMessage')) {
    function getOrderStatusMessage($order, $isNewOrder = false)
    {
        $messages = [
            'admin' => "Order #{$order->id} has been updated.",
            'store' => "Order #{$order->id} status has changed.",
            'customer' => "Your order #{$order->id} has been updated.",
            'deliveryman' => "New update for Order #{$order->id}.",
            'title' => "Order #{$order->id}."
        ];

        // If the order is newly placed
        if ($isNewOrder) {
            $messages['admin'] = "A new order #{$order->id} has been placed.";
            $messages['store'] = "You have received a new order #{$order->id}. Please review it.";
            $messages['customer'] = "Your order #{$order->id} has been placed successfully.";
            $messages['deliveryman'] = "A new order #{$order->id} will be assigned soon.";
            $messages['title'] = "Order Placed Successfully.";

            return $messages;
        }

        // message
        if ($order->status === 'pending') {
            $messages['admin'] = "A new order #{$order->id} is pending confirmation.";
            $messages['store'] = "New order #{$order->id} is waiting for approval.";
            $messages['customer'] = "Your order #{$order->id} is pending confirmation.";
            $messages['deliveryman'] = "Order #{$order->id} is pending, not yet assigned.";
            $messages['title'] = "Order #{$order->id} is pending";
        } elseif ($order->status === 'confirmed') {
            $messages['admin'] = "Order #{$order->id} has been confirmed by the store.";
            $messages['store'] = "You have confirmed order #{$order->id}.";
            $messages['customer'] = "Your order #{$order->id} has been confirmed and is being prepared.";
            $messages['deliveryman'] = "Order #{$order->id} is confirmed and will be assigned soon.";
            $messages['title'] = "Order #{$order->id} is confirmed";
        } elseif ($order->status === 'processing') {
            $messages['admin'] = "Order #{$order->id} is being processed.";
            $messages['store'] = "Order #{$order->id} is being processed.";
            $messages['customer'] = "Your order #{$order->id} is now in processing.";
            $messages['deliveryman'] = "Order #{$order->id} is still in processing state.";
            $messages['title'] = "Order #{$order->id} is processing";
        } elseif ($order->status === 'shipped') {
            $messages['admin'] = "Order #{$order->id} has been shipped.";
            $messages['store'] = "Order #{$order->id} has been shipped to the customer.";
            $messages['customer'] = "Your order #{$order->id} has been shipped.";
            $messages['deliveryman'] = "Order #{$order->id} is now out for delivery.";
            $messages['title'] = "Order #{$order->id} is shipped";
        } elseif ($order->status === 'delivered') {
            $messages['admin'] = "Order #{$order->id} has been successfully delivered.";
            $messages['store'] = "Order #{$order->id} has been delivered to the customer.";
            $messages['customer'] = "Your order #{$order->id} has been delivered. Thank you for shopping with us!";
            $messages['deliveryman'] = "Order #{$order->id} delivery is completed.";
            $messages['title'] = "Order #{$order->id} is delivered";
        } elseif ($order->status === 'cancelled') {
            $messages['admin'] = "Order #{$order->id} has been cancelled.";
            $messages['store'] = "Order #{$order->id} has been cancelled by the customer or admin.";
            $messages['customer'] = "Your order #{$order->id} has been cancelled.";
            $messages['deliveryman'] = "Order #{$order->id} has been cancelled. No delivery required.";
            $messages['title'] = "Order #{$order->id} is cancelled";
        }

        return $messages;
    }
}


if (!function_exists('get_currency_symbol')) {
    function get_currency_symbol(bool $asCode = false): string
    {
        // Define a local currency-symbol map
        $currencies = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'BDT' => '৳',
            'INR' => '₹',
            'JPY' => '¥',
            'CAD' => 'C$',
            'AUD' => 'A$',
            'MYR' => 'RM',
            'BRL' => 'R$',
            'ZAR' => 'R',
            'NGN' => '₦',
            'IDR' => 'Rp',
        ];

        $globalCurrency = com_option_get('com_site_global_currency') ?? '$';
        $symbol = $currencies[$globalCurrency] ?? '$';

        if ($asCode) {
            $symbol = $globalCurrency;
        }

        $addSpace = com_option_get('com_site_space_between_amount_and_symbol') === 'yes';

        return $addSpace ? " {$symbol} " : $symbol;
    }
}


if (!function_exists('format_currency')) {
    function amount_with_symbol_format($amount, $text = false)
    {
        $symbol = get_currency_symbol($text);
        $position = com_option_get('com_site_currency_symbol_position');
        $use_comma = com_option_get('com_site_comma_form_adjustment_amount') === 'yes';
        $formatted = number_format((float)$amount, 2, '.', $use_comma ? ',' : '');

        return $position === 'right' ? $formatted . $symbol : $symbol . $formatted;
    }
}

    function amount_with_symbol_format_for_response($amount, $text = 'USD')
    {
        $symbol = get_currency_symbol_for_response($text);
        $position = com_option_get('com_site_currency_symbol_position');
        $use_comma = com_option_get('com_site_comma_form_adjustment_amount') === 'yes';
        $formatted = number_format((float)$amount, 2, '.', $use_comma ? ',' : '');

        return $position === 'right' ? $formatted . $symbol : $symbol . $formatted;
    }

    function get_currency_symbol_for_response(string $asCode = 'USD'): string
    {
        $globalCurrency = com_option_get('com_site_global_currency') ?? '$';
        $symbol = $asCode ?? $globalCurrency;
        $addSpace = com_option_get('com_site_space_between_amount_and_symbol') === 'yes';
        return $addSpace ? " {$symbol} " : $symbol;
    }


if (!function_exists('isDemoMode')) {
    function isDemoMode(): bool
    {
        return config('demo.enable') === true;
    }
}


if (!function_exists('flattenArray')) {
    function flattenArray(array $array, string $prefix = ''): array
    {
        $result = [];

        foreach ($array as $key => $value) {
            $newKey = $prefix === '' ? $key : $prefix . '.' . $key;

            if (is_array($value)) {
                $result = array_merge($result, flattenArray($value, $newKey));
            } else {
                // Only flatten if value is string (we only translate text, not numbers)
                if (is_string($value)) {
                    $result[$newKey] = $value;
                }
            }
        }

        return $result;
    }
}



