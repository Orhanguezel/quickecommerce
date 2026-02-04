<?php

namespace App\Services;

use App\Helpers\DeliveryChargeHelper;
use App\Jobs\DispatchOrderEmails;
use App\Models\OrderAddress;
use App\Models\Store;
use App\Models\CustomerAddress;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\OrderMaster;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SystemCommission;
use App\Services\Order\OrderManageNotificationService;
use Illuminate\Support\Facades\DB;
use Modules\Subscription\app\Models\StoreSubscription;
use App\Helpers\ComHelper;

class OrderService
{
    protected $orderManageNotificationService;

    public function __construct(OrderManageNotificationService $orderManageNotificationService)
    {
        $this->orderManageNotificationService = $orderManageNotificationService;
    }

    public function createOrder($data)
    {
        try {
            $customer = auth()->guard('api_customer')->user();

            $shouldRound = shouldRound();
            //  check authenticated
            if (!$customer) {
                return false;
            }
            // customer ID
            $customer_id = $customer->id;
            $basePrice = 0;
            $total_package = count($data['packages']);
            $total_items = 0;
            foreach ($data['packages'] as $package) {
                $total_items += count($package['items']);
            }

            $currencyData = ComHelper::getCurrencyInfo($data['currency_code']);

            // check package
            // if store subscription system check
            // if store subscription expire or order limit end this store product not create order
            $totalBasePrice = 0;

            foreach ($data['packages'] as $packageData) {
                // if type subscription
                $store = Store::find($packageData['store_id']);

                // subscription check start
                if ($store->subscription_type == 'subscription') {
                    // check store subscription package
                    $store_subscription = StoreSubscription::where('store_id', $store->id)
                        ->whereDate('expire_date', '>=', now())
                        ->first();

                    // if expire subscription
                    if (empty($store_subscription)) {
                        return false;
                    }
                    $total_store_order = Order::whereNotIn('status', ['pending', 'cancelled', 'on_hold'])->count();
                    // check order limit
                    if (!empty($store_subscription) && $store_subscription->order_limit <= 0) {
                        return false;
                    }
                } // subscription check end


                foreach ($packageData['items'] as $itemData) {

                    // Find the product with flash sale & variants
                    $product = Product::with('variants', 'store', 'flashSaleProduct', 'flashSale')
                        ->find($itemData['product_id']);

                    if (!empty($product)) {
                        // Validate product variant
                        $variant = ProductVariant::where('id', $itemData['variant_id'])
                            ->where('product_id', $product->id)
                            ->first();

                        if ($variant && $variant->stock_quantity < $itemData['quantity']) {
                            return false;
                        }

                        if (!empty($variant) && isset($variant->price)) {

                            // Step 1: Get unit base price (considering special price)
                            $unitBasePrice = ($variant->special_price !== null && $variant->special_price > 0.00)
                                ? $variant->special_price
                                : $variant->price;

                            // Step 2: Check if flash sale applies
                            $discount = 0;
                            if (!empty($product->flashSale)) {
                                $flashSale = $product->flashSale;
                                $isExpired = now()->gt($flashSale->end_time);
                                $isInactive = $flashSale->status == 0;
                                $isOutOfLimit = $flashSale->purchase_limit == 0;

                                if (!$isExpired && !$isInactive && !$isOutOfLimit) {
                                    $discount = ($flashSale->discount_type === 'percentage')
                                        ? ($unitBasePrice * $flashSale->discount_amount / 100)
                                        : $flashSale->discount_amount;
                                }
                            }

                            // Step 3: Final price after discount
                            $unitFinalPrice = $unitBasePrice - $discount;

                            // Step 4: Multiply by quantity
                            $totalItemPrice = $unitFinalPrice * $itemData['quantity'];

                            // Step 5: Add to order total
                            $totalBasePrice += $totalItemPrice;
                        }
                    }
                }
            }
            // calculate order coupon
            $coupon_data = [
                'success' => false,
                'coupon_code' => null,
                'coupon_title' => null,
                'discount_amount' => 0,
                'coupon_type' => null,
                'discount_rate' => 0,
                'final_order_amount' => $totalBasePrice,
            ];
            $total_discount_amount = 0;
            if (!empty($data['coupon_code']) && isset($data['coupon_code'])) {
                $applied = applyCoupon($data['coupon_code'], $totalBasePrice);
                if ($applied['success']) {
                    $total_order_amount = $applied['final_order_amount'];
                    $total_discount_amount = $applied['discount_amount'];
                    $coupon_data = $applied;
                }
            }

            $system_commission = SystemCommission::latest()->first();
            $tax_disabled = $system_commission->order_include_tax_amount == 0;


            $order_master = OrderMaster::create([
                'customer_id' => $customer_id,
                'area_id' => 0, // main zone id
                'shipping_address_id' => 0,
                'coupon_code' => $coupon_data['success'] === false ? null : $data['coupon_code'] ?? null,
                'coupon_title' => $coupon_data['success'] === false ? null : $coupon_data['coupon_title'] ?? null,
                'coupon_discount_amount_admin' => $coupon_data['discount_amount'],
                'product_discount_amount' => 0,
                'flash_discount_amount_admin' => 0,
                'shipping_charge' => 0,
                'additional_charge_name' => null,
                'additional_charge_amount' => null,
                'additional_charge_commission' => null,
                'order_amount' => 0,
                'paid_amount' => 0,
                'payment_gateway' => $data['payment_gateway'],
                'payment_status' => 'pending',
                'order_notes' => $data['order_notes'] ?? null,
            ]);


            if (array_key_exists("shipping_address_id", $data)) {
                $customer_address = CustomerAddress::find($data['shipping_address_id']);
            }
            $deliveryOption = $data['packages'][0]['delivery_option'] ?? 'home_delivery';

            if ($deliveryOption === "takeaway") {

                $shipping_address = OrderAddress::create([
                    'order_master_id' => $order_master->id,
                    'area_id' => 0, // main zone id
                    'name' => array_key_exists("name", $data) ? $data['name'] : null,
                    'email' => array_key_exists("email", $data) ? $data['email'] : null,
                    'contact_number' => array_key_exists("contact_number", $data) ? $data['contact_number'] : null,
                    'type' => 'others'
                ]);

            } else {
                $shipping_address = OrderAddress::create([
                    'order_master_id' => $order_master->id,
                    'area_id' => 0, // main zone id
                    'shipping_address_id' => $customer_address->id,
                    'type' => $customer_address->type,
                    'email' => $customer_address->email,
                    'contact_number' => $customer_address->contact_number,
                    'address' => $customer_address->address,
                    'latitude' => $customer_address->latitude,
                    'longitude' => $customer_address->longitude,
                    'road' => $customer_address->road,
                    'house' => $customer_address->house,
                    'floor' => $customer_address->floor,
                    'postal_code' => $customer_address->postal_code,
                ]);
            }

            $order_master->shipping_address_id = $shipping_address->id;

            /*------------------>Create OrderAddress<------------------------------*/

            $calculate_total_order_amount_base_price = 0; // To accumulate the total price
            $main_order_amount_after_discount = 0; // To accumulate the total price
            $order_additional_charge_name = null;
            $order_additional_charge_amount = null;
            $order_additional_charge_store_amount = null;
            $order_admin_additional_charge_commission = null;

            // this calculations only for main order base price calculate
            foreach ($data['packages'] as $packageData) {
                foreach ($packageData['items'] as $itemData) {

                    // find the product
                    $product = Product::with('variants', 'store', 'flashSaleProduct', 'flashSale')->find($itemData['product_id']);
                    // Validate product variant
                    $variant = ProductVariant::where('id', $itemData['variant_id'])->where('product_id', $product->id)->first();
                    if (!empty($variant) && isset($variant->price)) {
                        $basePrice = ($variant->special_price > 0) ? $variant->special_price : $variant->price;
                    }
                    if (!empty($product) && !empty($variant)) {
                        // product flash sale info
                        $product_flash_sale_id = null;
                        $flash_sale_discount_type = null;
                        $flash_sale_discount_amount = 0.00;
                        $product_flash_sale_discount_rate = 0.00;

                        if (!empty($product->flashSale) && isset($product->flashSale->discount_amount)) {
                            $product_flash_sale_id = $product->flashSale?->id;
                            $flash_sale_discount_type = $product->flashSale->discount_type;
                            $flash_sale_discount_amount = $product->flashSale->discount_amount;
                            $product_flash_sale_discount_rate = $product->flashSale->discount_amount;

                            // Check if the flash sale has expired
                            $flash_sale_start_time = $product->flashSale->start_time;
                            $flash_sale_end_time = $product->flashSale->end_time;

                            // Check if current time is within the flash sale period
                            $current_time = now(); // Get the current time
                            $is_expired = $current_time->gt($flash_sale_end_time); // Check if current time is greater than the end time
                            $out_of_limit = $product->flashSale->purchase_limit == 0;
                            $is_inactive = $product->flashSale->status == 0;

                            if ($is_expired || $out_of_limit || $is_inactive) {
                                // Flash sale has expired
                                $product_flash_sale_id = null;
                                $flash_sale_discount_type = null;
                                $flash_sale_discount_amount = 0;
                                $product_flash_sale_discount_rate = 0;
                            }
                        };

                        // store and admin discount calculate per product wise
                        $flash_sale_admin_discount = ($flash_sale_discount_type === 'percentage') ? ($basePrice * $flash_sale_discount_amount / 100.00) : $flash_sale_discount_amount;
                        $flash_sale_admin_discount = shouldRound() ? round($flash_sale_admin_discount) : $flash_sale_admin_discount;
                        $finalPrice = $basePrice - $flash_sale_admin_discount;
                        $after_any_discount_final_price = $finalPrice;

                        $calculate_total_order_amount_base_price += $basePrice;
                        $main_order_amount_after_discount += $after_any_discount_final_price;

                    }
                }
            }


            // system commission
            // shipping charge calculate
            $order_shipping_charge = $system_commission->order_shipping_charge;


            //  packages and details
            $shipping_charge = 0;
            $customer_lat = $data['customer_latitude'] ?? null;
            $customer_lng = $data['customer_longitude'] ?? null;

            $coupon_discount_amount_admin_final = 0;
            $product_discount_amount_master = 0;
            $order_amount_master = 0;


            foreach ($data['packages'] as $packageData) {
                // find store wise area id
                $store_info = Store::find($packageData['store_id']);
                $store_area_id = $store_info->area_id;

                /// store type wise additional charge
                $store_type = $store_info->store_type;
                $store_type_info = \App\Models\StoreType::where('type', $store_type)->first();


                // area wise calculate delivery charge
                $deliveryChargeData = DeliveryChargeHelper::calculateDeliveryCharge($store_area_id, $customer_lat, $customer_lng);

                // Ensure delivery charge data is an array to avoid errors
                if (!is_array($deliveryChargeData)) {
                    $deliveryChargeData = ['delivery_charge' => null];
                }

                // Get the delivery charge or default to 0
                $final_shipping_charge = $deliveryChargeData['delivery_charge'] ?? 0;


                // If area-wise delivery charge is 0 or not set, use the default order shipping charge
                if (empty($deliveryChargeData['delivery_charge']) || $deliveryChargeData['delivery_charge'] == 0) {
                    $final_shipping_charge = $order_shipping_charge;
                }

                // delivery time
                $delivery_time = null;
                if (isset($packageData['delivery_time'])) {
                    $delivery_time = $packageData['delivery_time'] ?? null;
                }

                // Commission Rate on Delivery Charge (%)
                $commission_type = $system_commission->commission_type;
                $default_delivery_commission_charge = $system_commission->default_delivery_commission_charge;

                // Calculate admin commission based on type
                if ($commission_type === 'percentage') {
                    $delivery_charge_admin_commission = ($final_shipping_charge * $default_delivery_commission_charge) / 100;
                } elseif ($commission_type === 'fixed') {
                    $delivery_charge_admin_commission = $default_delivery_commission_charge;
                } else {
                    $delivery_charge_admin_commission = 0;
                }
                // the delivery charge commission
                $delivery_charge_admin_commission = min($delivery_charge_admin_commission, $final_shipping_charge);
                // Calculate Deliveryman's earning
                $delivery_charge_delivery_man_commission = $final_shipping_charge - $delivery_charge_admin_commission;

                // create order main order package wise
                $package = Order::create([
                    'order_master_id' => $order_master->id,
                    'store_id' => $packageData['store_id'],
                    'area_id' => $store_area_id,
                    'order_type' => 'regular', // if customer order create
                    'delivery_option' => $packageData['delivery_option'],
                    'delivery_type' => 'standard',
                    'delivery_time' => $delivery_time,
                    'order_amount' => 0,
                    'product_discount_amount' => 0,
                    'flash_discount_amount_admin' => 0,
                    'shipping_charge' => $packageData['delivery_option'] === 'home_delivery' ? $final_shipping_charge : 0,
                    'delivery_charge_admin' => $packageData['delivery_option'] === 'home_delivery' ? $delivery_charge_delivery_man_commission : 0, // Full delivery charge
                    'delivery_charge_admin_commission' => $packageData['delivery_option'] === 'home_delivery' ? $delivery_charge_admin_commission : 0, // Admin commission on delivery charge
                    'is_reviewed' => false,
                ]);

                $package->payment_status = 'pending';
                $package->status = 'pending';
                // set order package discount info
                $order_package_total_amount = 0;
                $product_discount_amount_package = 0;
                $flash_discount_amount_admin = 0;
                $coupon_discount_amount_admin = 0;
                $package_order_amount_store_value = 0;
                $package_order_amount_admin_commission = 0;
                $item_amount_for_additional_charge_calculation = 0;
                // per item calculate
                foreach ($packageData['items'] as $itemData) {
                    // find the product
                    $product = Product::with('variants', 'store', 'flashSaleProduct', 'flashSale')->find($itemData['product_id']);
                    // Validate product variant
                    $variant = ProductVariant::where('id', $itemData['variant_id'])->where('product_id', $product->id)->first();

                    $product_discount_amount = ($variant->special_price < $variant->price)
                        ? ($variant->price - $variant->special_price) * $itemData['quantity']
                        : 0;
                    $product_discount_amount_master += $product_discount_amount;
                    $product_discount_amount_package += $product_discount_amount;
                    if (!empty($variant) && isset($variant->price)) {
                        $basePrice = ($variant->special_price > 0) ? $variant->special_price : $variant->price;
                    }

                    if (!empty($product) && !empty($variant)) {
                        // product flash sale info
                        $product_flash_sale_id = null;
                        $flash_sale_discount_type = null;
                        $flash_sale_discount_amount = 0.00;
                        $product_flash_sale_discount_rate = 0.00;
                        // Flash Sale Calculation
                        if (!empty($product->flashSale) && isset($product->flashSale->discount_amount)) {
                            $product_flash_sale_id = $product->flashSale?->id;
                            $flash_sale_discount_type = $product->flashSale->discount_type;
                            $flash_sale_discount_amount = $product->flashSale->discount_amount;
                            $product_flash_sale_discount_rate = $product->flashSale->discount_amount;

                            // Check if the flash sale has expired
                            $flash_sale_start_time = $product->flashSale->start_time;
                            $flash_sale_end_time = $product->flashSale->end_time;

                            // Check if current time is within the flash sale period
                            $current_time = now(); // Get the current time
                            $is_expired = $current_time->gt($flash_sale_end_time); // Check if current time is greater than the end time
                            $out_of_limit = $product->flashSale->purchase_limit == 0;
                            $is_inactive = $product->flashSale->status == 0;

                            if ($is_expired || $out_of_limit || $is_inactive) {
                                // Flash sale has expired
                                $product_flash_sale_id = null;
                                $flash_sale_discount_type = null;
                                $flash_sale_discount_amount = 0;
                                $product_flash_sale_discount_rate = 0;

                                $flash_sale_admin_discount = 0;
                            } else {
                                // store and admin discount calculate per product wise
                                $flash_sale_admin_discount = ($flash_sale_discount_type === 'percentage')
                                    ? ($basePrice * $flash_sale_discount_amount / 100.00)
                                    : $flash_sale_discount_amount;
                                $flash_sale_admin_discount = shouldRound() ? round($flash_sale_admin_discount) : $flash_sale_admin_discount;
                            }
                        } else {
                            $flash_sale_admin_discount = 0;
                        }


                        // Calculate final price
                        $finalPrice = $basePrice - $flash_sale_admin_discount;

                        // line total price with qty
                        $line_total_price_with_qty = $finalPrice - $itemData['quantity'];

                        // after flash sale discount
                        $after_flash_sale_discount_final_price = $finalPrice;

                        // Calculate final price after all discounts (flash sale + coupon)
                        $after_any_discount_final_price = $after_flash_sale_discount_final_price;

                        // total quantity and after flash discount
                        $after_discount_final_price_with_qty = $after_any_discount_final_price * $itemData['quantity'];

                        // without tax line total price  and - coupon total discount
                        $line_total_excluding_tax = $after_discount_final_price_with_qty;

                        // vat/tax calculate
                        $store_tax_amount = $product->store?->tax;
                        $taxAmount = ($after_any_discount_final_price / 100) * $store_tax_amount;

                        // Total tax amount based on quantity
                        $total_tax_amount = $taxAmount * $itemData['quantity'];
                        if ($tax_disabled) {
                            $store_tax_amount = 0;
                            $taxAmount = 0;
                            $total_tax_amount = 0;
                        }
                        // Final line total price based on quantity
                        $line_total_price = shouldRound() ? round($line_total_excluding_tax + $total_tax_amount) : round($line_total_excluding_tax + $total_tax_amount, 2);

                        // Initialize commission variables
                        $system_commission_type = null;
                        $system_commission_amount = 0.00;
                        $admin_commission_amount = 0.00;
                        // calculate commission
                        if (isset($system_commission) && $system_commission->commission_enabled === true) {
                            // Check store type
                            if ($product->store) {
                                $store_subscription_type = $product->store?->subscription_type;
                                // If store is commission-based
                                if ($store_subscription_type === 'commission') {
                                    $system_commission_type = $system_commission->commission_type;
                                    $system_commission_amount = $system_commission->commission_amount;

                                    // Calculate admin commission based on type
                                    if ($system_commission_type === 'percentage') {
                                        $admin_commission_amount = round(($line_total_excluding_tax / 100.00) * $system_commission_amount, 2);
                                    } elseif ($system_commission_type === 'fixed') {
                                        $admin_commission_amount = $system_commission_amount;
                                    }
                                }
                            }
                        }


                        // create order details add
                        $orderDetails = OrderDetail::create([
                            'order_id' => $package->id,
                            'store_id' => $product->store?->id,
                            'area_id' => $product->store?->area_id,
                            'product_id' => $product->id,
                            'product_sku' => $variant->sku,
                            'behaviour' => $product->behaviour,

                            'variant_details' => $variant->attributes,
                            'product_campaign_id' => $product_flash_sale_id,

                            // admin discount amount
                            'admin_discount_type' => $flash_sale_discount_type,
                            'admin_discount_rate' => $product_flash_sale_discount_rate,
                            'admin_discount_amount' => $flash_sale_admin_discount,

                            // price and qty
                            'base_price' => $basePrice,
                            'price' => $after_any_discount_final_price,
                            'quantity' => $itemData['quantity'],
                            'line_total_price_with_qty' => $after_discount_final_price_with_qty,
                            'line_total_excluding_tax' => $line_total_excluding_tax, // Total without tax
                            'tax_rate' => $store_tax_amount,
                            'tax_amount' => $taxAmount,
                            'total_tax_amount' => $total_tax_amount,
                            'line_total_price' => $line_total_price,

                            // admin commission
                            'admin_commission_type' => $system_commission_type,
                            'admin_commission_rate' => $system_commission_amount,
                            'admin_commission_amount' => $admin_commission_amount,
                        ]);


                        // set order package discount info
                        $order_package_total_amount += $orderDetails->line_total_price;

                        $flash_discount_amount_admin += $orderDetails->admin_discount_amount * $itemData['quantity'];
                        $coupon_discount_amount_admin += $orderDetails->coupon_discount_amount * $itemData['quantity'];

                        // order package update other info
                        $package_order_amount_store_value += $orderDetails->line_total_price - $orderDetails->admin_commission_amount;
                        $package_order_amount_admin_commission += $orderDetails->admin_commission_amount;
                    }
                    $item_amount_for_additional_charge_calculation += $after_discount_final_price_with_qty;

                    if ($product->flashSale && $product->flashSale->purchase_limit >= $itemData['quantity']) {
                        $product->flashSale->decrement('purchase_limit', $itemData['quantity']);
                    }

                } // item loops end order details
                /// additional charge calculation
                if ($store_type_info && $store_type_info->additional_charge_enable_disable) {

                    $order_additional_charge_name = $store_type_info->additional_charge_name;
                    $order_additional_charge_amount = round(
                        $store_type_info->additional_charge_type == 'percentage'
                            ? ($item_amount_for_additional_charge_calculation / 100) * $store_type_info->additional_charge_amount
                            : $store_type_info->additional_charge_amount,
                        2 // number of decimal places
                    );
                    $order_admin_additional_charge_commission = round(($order_additional_charge_amount / 100) * $store_type_info->additional_charge_commission, 2);
                    $order_additional_charge_store_amount = round(($order_additional_charge_amount - $order_admin_additional_charge_commission), 2);

                    /// Update Order
                    $package->order_additional_charge_name = $order_additional_charge_name;
                    $package->order_additional_charge_amount = shouldRound() ? round($order_additional_charge_amount) : $order_additional_charge_amount;
                    $package->order_admin_additional_charge_commission = shouldRound() ? round($order_admin_additional_charge_commission) : $order_admin_additional_charge_commission;
                    $package->order_additional_charge_store_amount = shouldRound() ? round($order_additional_charge_store_amount) : $order_additional_charge_store_amount;

                    /// Update Order Master
                    $order_master->additional_charge_amount += $order_additional_charge_amount;
                    $order_master->additional_charge_commission += $order_admin_additional_charge_commission;
                    $order_master->save();
                }

                // update order package details
                $package->order_amount = $order_package_total_amount + $package->shipping_charge + $package->order_additional_charge_amount; //order package total amount
                $package->product_discount_amount += $product_discount_amount_package; // product coupon  discount
                $package->flash_discount_amount_admin = $flash_discount_amount_admin;  // flash sale discount
                $package->order_amount_store_value = $package_order_amount_store_value; // order_amount_admin_commission
                $package->order_amount_admin_commission = $package_order_amount_admin_commission; // order_amount_admin_commission
                $package->save();

                // Accumulate package values for the main order
                $order_amount_master += $package->order_amount;
                $flash_discount_amount_admin += $flash_discount_amount_admin;

                $coupon_discount_amount_admin_final += $coupon_discount_amount_admin;
                $shipping_charge += $package->shipping_charge;
                $order_package_total_amount += $package->order_amount;
            } // end order package

            // Update Order Master
            $this->distributeCouponDiscount($order_master);
            $order_master->product_discount_amount = $shouldRound ? round($product_discount_amount_master) : $product_discount_amount_master;
            $order_master->flash_discount_amount_admin = $shouldRound ? round($order_master->orders->sum('flash_discount_amount_admin')) : $order_master->orders->sum('flash_discount_amount_admin');

            $order_master->shipping_charge = $shouldRound ? round($shipping_charge) : $shipping_charge;
            $order_master->order_amount = $shouldRound ? round($order_master->orders->sum('order_amount')) : $order_master->orders->sum('order_amount');
            //currency info
            $order_master->default_currency_code = $currencyData['default_currency'];
            $order_master->currency_code = $currencyData['currency_code'];
            $order_master->exchange_rate = $currencyData['exchange_rate'];
            $order_master->save();
            // return all order id
            $all_orders = Order::with('store.seller')->where('order_master_id', $order_master->id)->get();
            $order_master = OrderMaster::with('orderAddress', 'customer')->find($order_master->id);

            // order notification
            $all_orders_ids = Order::where('order_master_id', $order_master->id)->pluck('id')->toArray();

            // notification send
            $this->orderManageNotificationService->createOrderNotification($all_orders_ids, 'new-order');

            // mail send Dispatch the email job asynchronously
            dispatch(new DispatchOrderEmails($order_master->id));

            return [
                $all_orders,
                $order_master,
                'customer' => $customer,
            ];

        } catch (\Exception $e) {
        }
    }

    public function updateOrderStatus($orderId, $status)
    {
        $order = Order::findOrFail($orderId);
        $order->status = $status;
        $order->save();
        return $order;
    }

    public function getOrderDetails($orderId)
    {
        $order = Order::with(['orderItems', 'sellerStore'])->findOrFail($orderId);
        return $order;
    }

    public function distributeCouponDiscount(OrderMaster $orderMaster): void
    {
        DB::transaction(function () use ($orderMaster) {

            $orderDetails = $orderMaster->orders()->with('orderDetail')->get()->flatMap->orderDetail;
            $totalLineAmount = $orderDetails->sum('line_total_price_with_qty');

            $hasValidDiscount = $totalLineAmount > 0 && $orderMaster->coupon_discount_amount_admin > 0;

            if ($hasValidDiscount) {
                $remainingDiscount = $orderMaster->coupon_discount_amount_admin;
                $distributedTotal = 0;

                // Step 1: Distribute coupon discount to each OrderDetail
                foreach ($orderDetails as $index => $detail) {
                    $lineTotal = $detail->line_total_price_with_qty;

                    if ($index === $orderDetails->count() - 1) {
                        $discount = $remainingDiscount - $distributedTotal;
                    } else {
                        $discount = ($lineTotal / $totalLineAmount) * $orderMaster->coupon_discount_amount_admin;
                        $distributedTotal += $discount;
                    }

                    $detail->update([
                        'coupon_discount_amount' => $discount,
                        'line_total_excluding_tax' => $lineTotal - $discount,
                        'tax_amount' => ($lineTotal / 100 * $detail->tax_rate) / $detail->quantity,
                        'total_tax_amount' => $lineTotal / 100 * $detail->tax_rate,
                        'line_total_price' => ($lineTotal - $discount) + round($lineTotal / 100 * $detail->tax_rate, 2),
                        'admin_commission_amount' => $detail->admin_commission_type === 'percentage'
                            ? $lineTotal / 100 * $detail->admin_commission_rate
                            : $detail->admin_commission_rate,
                    ]);
                }
            }

            // REFRESH orderMaster with fresh relations after updates
            $orderMaster->load(['orders.orderDetail']);

            // Step 2: Distribute per Order
            foreach ($orderMaster->orders as $order) {
                $sumCoupon = $order->orderDetail->sum('coupon_discount_amount');
                $sumLineTotal = $order->orderDetail->sum('line_total_price');
                $shipping = $order->shipping_charge;
                $addCharge = $order->order_additional_charge_amount;
                $commission = $order->order_amount_admin_commission;
                $storeAddCharge = $order->order_additional_charge_store_amount;

                $orderDiscount = shouldRound() ? round($sumCoupon) : $sumCoupon;
                $orderAmount = shouldRound()
                    ? (round($sumLineTotal) + round($shipping) + round($addCharge))
                    : ($sumLineTotal + $shipping + $addCharge);

                $orderAmountStoreValue = max($sumLineTotal - $commission + $storeAddCharge, 0);

                $order->update([
                    'order_amount_store_value' => $orderAmountStoreValue,
                    'order_amount' => $orderAmount,
                    'coupon_discount_amount_admin' => $orderDiscount,
                ]);
            }
        });

        // Step 3: Apply rounded fields if rounding is enabled
        if (shouldRound()) {
            $orderDetails = $orderMaster->orders()->with('orderDetail')->get()->flatMap->orderDetail;
            foreach ($orderDetails as $detail) {
                $detail->applyRoundedFields()->save();
            }

            foreach ($orderMaster->orders as $order) {
                $order->applyRoundedFields()->save();
            }

            $orderMaster->applyRoundedFields()->save();
        }
    }

}
