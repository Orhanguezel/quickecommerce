<?php

return [
    'google_feed_ads_eligible_only' => env('GOOGLE_FEED_ADS_ELIGIBLE_ONLY', false),
    'market_price_max_age_hours' => (int) env('MARKET_PRICE_MAX_AGE_HOURS', 48),
    'max_ad_price_index' => (float) env('MAX_AD_PRICE_INDEX', 1.15),
    'ad_pilot_excluded_sources' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('AD_PILOT_EXCLUDED_SOURCES', 'dropick,speedwa,swan,powertec,raketspor,maraton'))
    ))),
    'abandoned_cart_stage_2_coupon' => env('ABANDONED_CART_STAGE_2_COUPON'),
    'abandoned_cart_stage_2_discount' => (int) env('ABANDONED_CART_STAGE_2_DISCOUNT', 0),
    'abandoned_cart_stage_3_coupon' => env('ABANDONED_CART_STAGE_3_COUPON'),
    'abandoned_cart_stage_3_discount' => (int) env('ABANDONED_CART_STAGE_3_DISCOUNT', 0),
    'abandoned_cart_max_reminders_30d' => (int) env('ABANDONED_CART_MAX_REMINDERS_30D', 3),
    'abandoned_cart_stage_3_min_total' => (float) env('ABANDONED_CART_STAGE_3_MIN_TOTAL', 2500),
];
