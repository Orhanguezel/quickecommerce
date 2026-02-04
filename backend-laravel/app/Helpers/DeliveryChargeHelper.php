<?php

namespace App\Helpers;

use App\Models\StoreArea;
use App\Models\SystemCommission;
use Illuminate\Support\Facades\DB;

class DeliveryChargeHelper
{
    public static function calculateDeliveryCharge($areaId, $customerLat, $customerLng)
    {

        // Get the store area and settings
        $store_area = StoreArea::with('storeTypeSettings')->find($areaId);
        $systemSettings = SystemCommission::first();
        $shouldRound = shouldRound();

        // If not found, try to find the nearest store area based on latitude & longitude
        if (!$store_area) {
            $store_area = StoreArea::with('storeTypeSettings')->selectRaw(
                "*, ST_Distance_Sphere(point(center_longitude, center_latitude), point(?, ?)) as distance",
                [$customerLng, $customerLat]
            )
                ->whereNotNull('center_latitude')
                ->whereNotNull('center_longitude')
                ->where('status', 1)
                ->orderBy('distance')
                ->first();
        }

        // if area wise settings not set
        if (!$store_area->storeTypeSettings) {
            return [
                'status' => false,
                'message' => 'Calculation failed',
                'delivery_method' => 'failed',
                'delivery_charge' => $shouldRound ? round($systemSettings->order_shipping_charge) : round($systemSettings->order_shipping_charge, 2),
                'distance_km' => 0,
                'info' => 'area settings not found or empty',
            ];
        }

        if (!empty($store_area)) {
            $settings = $store_area->storeTypeSettings->first();
            $store_lat = $store_area->center_latitude;
            $store_lng = $store_area->center_longitude;

            // Calculate distance using Haversine formula
            $distance = DB::select("
        SELECT ST_Distance_Sphere(
            point(?, ?),
            point(?, ?)
        ) / 1000 as distance
    ", [$store_lng, $store_lat, $customerLng, $customerLat])[0]->distance;

            $distance = max(1, round($distance, 2));
            // new add
            $is_out_of_area = DB::table('store_areas')
                ->select(DB::raw('ST_Contains(coordinates, ST_GeomFromText(?)) AS is_inside'))
                ->where('id', $areaId)
                ->addBinding("POINT({$customerLng} {$customerLat})", 'select')
                ->first();

            // Ensure the query result is not null and extract the actual "inside" flag
            $is_inside_area = $is_out_of_area ? (bool)$is_out_of_area->is_inside : false;

            // Now use the correct condition
            $out_of_area_delivery_charge = $is_inside_area ? 0 : ($settings->out_of_area_delivery_charge ?? 0);
            $out_of_area_delivery_info = $is_inside_area ? 'in area' : 'out of area';

            // Initialize delivery charge
            $delivery_charge = 0;
            $remaining_distance = $distance;

            $storeAreaSetting = $store_area->storeTypeSettings->first();
            if ($settings->delivery_charge_method === 'fixed') {
                $delivery_charge = $settings->fixed_charge_amount;
            } elseif ($settings->delivery_charge_method === 'per_km') {
                $delivery_charge = $settings->per_km_charge_amount * $distance;
            } elseif ($settings->delivery_charge_method === 'range-wise') {
                // Get the slabs for this store area
                $slabs = DB::table('store_area_setting_range_charges')
                    ->where('store_area_setting_id', $storeAreaSetting->id)
                    ->orderBy('min_km', 'asc') // Ensure slabs are in order
                    ->get();

                // Loop through the slabs and calculate the charge
                foreach ($slabs as $slab) {
                    $slab_min = $slab->min_km;
                    $slab_max = $slab->max_km;
                    $slab_rate = $slab->charge_amount;

                    // Check if there is remaining distance in the current slab range
                    if ($remaining_distance <= 0) {
                        break; // No remaining distance, stop the loop
                    }

                    if ($remaining_distance > $slab_max) {
                        // If the remaining distance is greater than the slab's max, apply the full slab rate
                        $distance_in_this_slab = $slab_max - $slab_min;
                        $delivery_charge += $distance_in_this_slab * $slab_rate;
                        $remaining_distance -= $distance_in_this_slab;

                    } elseif ($remaining_distance > $slab_min) {
                        // If the remaining distance fits within the current slab
                        $distance_in_this_slab = $remaining_distance - $slab_min;
                        $delivery_charge += $distance_in_this_slab * $slab_rate;
                        $remaining_distance = 0; // No remaining distance to calculate
                    }
                }

                // If there is still remaining distance, apply it to the last slab's rate
                if ($remaining_distance > 0) {
                    // Get the last slab
                    $last_slab = $slabs->last();
                    $delivery_charge += $remaining_distance * $last_slab->charge_amount;
                }
            }

            // Add out-of-area charge if applicable
            $delivery_charge += $out_of_area_delivery_charge;
            // Ensure minimum delivery fee
            $delivery_charge = max($settings->min_order_delivery_fee, $delivery_charge);

            return [
                'status' => true,
                'message' => 'Calculation successful',
                'delivery_method' => $settings->delivery_charge_method,
                'delivery_charge' => $shouldRound ? round($delivery_charge) : round($delivery_charge, 2),
                'distance_km' => $shouldRound ? round($distance) : round($distance, 2),
                'info' => $out_of_area_delivery_info,
            ];
        } else {
            return [
                'status' => false,
                'message' => 'Calculation failed',
                'delivery_method' => 'failed',
                'delivery_charge' => $shouldRound ? round($systemSettings->order_shipping_charge) : round($systemSettings->order_shipping_charge, 2),
                'distance_km' => 0,
                'info' => 'area not found',
            ];
        }
    }


}
