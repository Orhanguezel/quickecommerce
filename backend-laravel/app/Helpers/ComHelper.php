<?php

namespace App\Helpers;

use App\Models\Translation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;
use Modules\PaymentGateways\app\Models\Currency;

class ComHelper
{
    public static function format_coordiantes($coordinates)
    {
        $data = [];
        foreach ($coordinates as $coord) {
            $data[] = (object)['lat' => $coord[1], 'lng' => $coord[0]];
        }
        return $data;
    }

    /**
     * SAFE: resolve requested language without changing external contracts.
     * Priority:
     * - query: ?language=tr or ?locale=tr
     * - header: X-Language / X-Locale / Accept-Language
     * - app.locale
     */
    private static function resolveLang(?string $explicit = null): ?string
    {
        if ($explicit) {
            return self::normalizeLang($explicit);
        }

        // Query params
        $qLang = request()->get('language') ?: request()->get('locale');
        if ($qLang) {
            return self::normalizeLang($qLang);
        }

        // Custom headers (common patterns)
        $hLang = request()->header('X-Language') ?: request()->header('X-Locale');
        if ($hLang) {
            return self::normalizeLang($hLang);
        }

        // Accept-Language (take first token)
        $accept = request()->header('Accept-Language');
        if ($accept) {
            $first = trim(explode(',', $accept)[0] ?? '');
            if ($first) return self::normalizeLang($first);
        }

        // Fallback
        $appLocale = config('app.locale');
        return $appLocale ? self::normalizeLang($appLocale) : null;
    }

    private static function normalizeLang(string $lang): string
    {
        // "tr-TR" -> "tr"
        $lang = trim($lang);
        if ($lang === '') return $lang;
        $lang = str_replace('_', '-', $lang);
        $parts = explode('-', $lang);
        return strtolower($parts[0] ?? $lang);
    }

    /**
     * SAFE: pick localized perm_title from grouped translations.
     * - If translation exists for requested lang and key=perm_title, use it.
     * - Else fallback to $fallbackTitle (original permission title).
     */
    private static function pickPermTitle(string $fallbackTitle, $translationsGrouped, ?string $lang): string
    {
        if (!$lang) return $fallbackTitle;
        if (!$translationsGrouped) return $fallbackTitle;

        // $translationsGrouped is Collection grouped by language (string => Collection)
        if (!isset($translationsGrouped[$lang])) return $fallbackTitle;

        $val = $translationsGrouped[$lang]->where('key', 'perm_title')->first()->value ?? null;
        return !empty($val) ? $val : $fallbackTitle;
    }

    public static function getPermissionBuildMenuTree(array $role_id, $data_list)
    {
        $tree = [];
        $lang = self::resolveLang(); // ✅ new, but safe

        foreach ($data_list as $data_item) {
            // children recursively
            $children = $data_item->childrenRecursive != '' && count($data_item->childrenRecursive)
                ? ComHelper::buildMenuTree($role_id, $data_item->childrenRecursive)
                : [];

            $rolePermissions = DB::table('role_has_permissions')
                ->where('permission_id', $data_item->id)
                ->whereIn('role_id', $role_id)
                ->get();

            $translationsGrouped = Translation::where('translatable_type', 'App\Models\Permissions')
                ->where('translatable_id', $data_item->id)
                ->get()
                ->groupBy('language');

            // keep translations array shape (unchanged)
            $transformedData = [];
            foreach ($translationsGrouped as $language => $items) {
                $transformedData[] = [
                    'language' => $language,
                    'perm_title' => $items->where('key', 'perm_title')->first()->value ?? null,
                ];
            }

            // ✅ localized title for frontend sidebar
            $permTitle = self::pickPermTitle((string)$data_item->perm_title, $translationsGrouped, $lang);

            $options = [];
            $decodedOptions = $data_item->options;

            if (is_string($decodedOptions)) {
                $decodedOptions = json_decode($decodedOptions, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $decodedOptions = [];
                }
            }

            $hasAnyPermission = false;

            if (is_array($decodedOptions)) {
                $options = array_map(function ($allowedValue) use ($rolePermissions, &$hasAnyPermission) {
                    if (!is_string($allowedValue)) return null;

                    $hasPermission = false;

                    foreach ($rolePermissions as $rolePermission) {
                        $permValue = null;

                        if (is_object($rolePermission)) {
                            if (property_exists($rolePermission, $allowedValue)) {
                                $permValue = $rolePermission->$allowedValue;
                            } elseif (property_exists($rolePermission, strtolower($allowedValue))) {
                                $permValue = $rolePermission->{strtolower($allowedValue)};
                            }
                        } else {
                            if (isset($rolePermission[$allowedValue])) {
                                $permValue = $rolePermission[$allowedValue];
                            } elseif (isset($rolePermission[strtolower($allowedValue)])) {
                                $permValue = $rolePermission[strtolower($allowedValue)];
                            }
                        }

                        if ($permValue !== null && ($permValue === 1 || $permValue === '1' || $permValue === true || $permValue === 'true')) {
                            $hasPermission = true;
                            $hasAnyPermission = true;
                            break;
                        }
                    }

                    return [
                        'label' => $allowedValue,
                        'value' => $hasPermission,
                    ];
                }, $decodedOptions);

                $options = array_filter($options);

                // keep only true values
                $options = array_filter($options, function ($option) {
                    return $option['value'] === true;
                });
            }

            $hasChildrenWithPermissions = !empty($children);

            if ($hasAnyPermission || $hasChildrenWithPermissions) {
                $tree[] = [
                    'id' => $data_item->id,
                    'perm_title' => $permTitle, // ✅ changed (localized)
                    'perm_name' => $data_item->name,
                    'type' => $data_item->type ?? null,
                    'icon' => $data_item->icon,
                    'translations' => $transformedData,
                    'options' => array_values($options),
                    'children' => $children,
                ];
            }
        }

        return $tree;
    }

    // NOTE: This method wasn't used in your snippet; left untouched structurally.
    private function propagateViewTrue(&$permissions)
    {
        foreach ($permissions as &$permission) {
            if (!empty($permission['children'])) {
                $this->propagateViewTrue($permission['children']);

                foreach ($permission['children'] as $child) {
                    foreach ($child['options'] as $opt) {
                        if (strtolower($opt['label']) === 'view' && $opt['value'] === true) {
                            $parentHasView = false;

                            foreach ($permission['options'] as &$parentOpt) {
                                if (strtolower($parentOpt['label']) === 'view') {
                                    $parentOpt['value'] = true;
                                    $parentHasView = true;
                                    break;
                                }
                            }

                            if (!$parentHasView) {
                                $permission['options'][] = [
                                    'label' => 'view',
                                    'value' => true
                                ];
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    public static function buildMenuTree(array $role_id, $data_list)
    {
        $tree = [];
        $lang = self::resolveLang(); // ✅ new, but safe

        foreach ($data_list as $data_item) {
            $children = $data_item->childrenRecursive != '' && count($data_item->childrenRecursive)
                ? ComHelper::buildMenuTree($role_id, $data_item->childrenRecursive)
                : [];

            $users = DB::table('role_has_permissions')
                ->where('permission_id', $data_item->id)
                ->whereIn('role_id', $role_id)
                ->first();

            $translationsGrouped = Translation::where('translatable_type', 'App\Models\Permissions')
                ->where('translatable_id', $data_item->id)
                ->get()
                ->groupBy('language');

            // keep translations array shape (unchanged)
            $transformedData = [];
            foreach ($translationsGrouped as $language => $items) {
                $transformedData[] = [
                    'language' => $language,
                    'perm_title' => $items->where('key', 'perm_title')->first()->value ?? null,
                ];
            }

            // ✅ localized perm_title
            $permTitle = self::pickPermTitle((string)$data_item->perm_title, $translationsGrouped, $lang);

            $options = [];
            $decodedOptions = $data_item->options;

            if (is_string($decodedOptions)) {
                $decodedOptions = json_decode($decodedOptions, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    logger('JSON decode error for options:', [
                        'error' => json_last_error_msg(),
                        'options' => $data_item->options,
                    ]);
                    $decodedOptions = [];
                }
            }

            if (is_array($decodedOptions)) {
                $options = array_map(function ($allowedValue) use ($users) {
                    if (!is_string($allowedValue)) {
                        logger('Invalid allowed value type:', ['allowedValue' => $allowedValue]);
                        return null;
                    }

                    return [
                        'label' => $allowedValue,
                        'value' => $users && property_exists($users, $allowedValue)
                            ? (bool)$users->$allowedValue
                            : false,
                    ];
                }, $decodedOptions);

                $options = array_filter($options);
            } else {
                logger('Decoded options is not an array or is invalid:', ['decodedOptions' => $decodedOptions]);
            }

            $tree[] = [
                'id' => $data_item->id,
                'perm_title' => $permTitle, // ✅ changed (localized)
                'perm_name' => $data_item->name,
                'type' => $data_item->type ?? null,
                'icon' => $data_item->icon,
                'translations' => $transformedData,
                'options' => $options,
                'children' => $children,
            ];
        }

        return $tree;
    }

    public static function markAssignedPermissions($permissions, $rolePermissions)
    {
        return $permissions->map(function ($permission) use ($rolePermissions) {
            $permission->is_assigned = $rolePermissions->contains('id', $permission->id);

            if ($permission->relationLoaded('childrenRecursive')) {
                $permission->children = ComHelper::markAssignedPermissions(
                    $permission->children,
                    $rolePermissions
                );
            }

            return $permission;
        });
    }

    public static function getCurrencyInfo(?string $currencyCode = null): array
    {
        $defaultCode = config('app.default_currency', 'USD');
        $code = $currencyCode ?: $defaultCode;
        $currency = Currency::where('code', $code)->first();

        return [
            'default_currency' => $defaultCode,
            'currency_code'    => $code,
            'exchange_rate'    => $currency?->exchange_rate ?? 1,
        ];
    }
}
