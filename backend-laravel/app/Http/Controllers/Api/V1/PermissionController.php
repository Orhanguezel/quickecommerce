<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PermissionKey;
use App\Helpers\ComHelper;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\SellerRoleResource;
use App\Models\CustomPermission;
use App\Models\Store;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;
use Spatie\QueryBuilder\QueryBuilder;

class PermissionController extends Controller
{
    public function permissions(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        $roleIds = $user->roles()->pluck('id');
        $shop_count = 1; // Primarily Pass For All

        $permissions = null;

        // Now Check if user is a Store User and he have assigned Stores
        if ($user->activity_scope == 'store_level') {
            $shop_count = Store::where('store_seller_id', $user->id)->count();
        }

        if ($shop_count > 0) {
            if ($user->activity_scope == 'store_level' && !empty($request->store_slug)) {

                // Get store with subscription info
                $store = Store::with('activeSubscription')
                    ->where('slug', $request->store_slug)
                    ->where('store_seller_id', $user->id)
                    ->first();

                $permissions = $user->rolePermissionsQuery()
                    ->whereNull('parent_id')
                    ->with([
                        'childrenRecursive' => function ($query) use ($roleIds) {
                            $query->whereHas('roles', function ($q) use ($roleIds) {
                                $q->whereIn('role_id', $roleIds);
                            })->with([
                                'childrenRecursive' => function ($subQuery) use ($roleIds) {
                                    $subQuery->whereHas('roles', function ($q) use ($roleIds) {
                                        $q->whereIn('role_id', $roleIds);
                                    });
                                }
                            ]);
                        }
                    ])->get();

                // filtering for pos and chat subscription permission check function
                if (!empty($store) && $store->subscription_type === 'subscription' && $store->activeSubscription?->pos_system === 0) {
                    $permissions = $permissions
                        ->reject(fn($permission) => $permission->name === 'POS Management')
                        ->values();
                }

                // chat permission remove
                if (!empty($store) && $store->subscription_type === 'subscription' && $store->activeSubscription?->live_chat === 0) {
                    $permissions = $permissions->map(function ($permission) {
                        if ($permission->perm_title === 'Communication Center') {
                            $filteredChildren = $permission->childrenRecursive
                                ->reject(fn($child) => $child->perm_title === 'Chat List');

                            $permission->setRelation('childrenRecursive', $filteredChildren);
                        }
                        return $permission;
                    });
                }

            } elseif ($user->activity_scope == 'store_level' && empty($request->store_slug)) {

                $permissionsArray = [
                    'dashboard',
                    PermissionKey::SELLER_STORE_MY_SHOP->value,
                ];

                $permissions = $user->rolePermissionsQuery()
                    ->whereIn('name', $permissionsArray)
                    ->get()
                    ->map(function ($permission) {
                        if (is_string($permission->options)) {
                            $permission->options = json_decode($permission->options, true);
                        }
                        $permission->type = $permission->parent_id === null ? 'parent' : 'child';
                        return $permission;
                    });

                $parents = $permissions->filter(fn($p) => $p->parent_id === null)->keyBy('id');
                $children = $permissions->filter(fn($p) => $p->parent_id !== null);

                foreach ($children as $child) {
                    if ($parents->has($child->parent_id)) {
                        $child->type = 'child';
                        $parents[$child->parent_id]->children[] = $child;
                    }
                }

                // $result unused in original code; keep behavior (no return needed)
                $permissions->map(function ($permission) {
                    $permission->type = $permission->parent_id === null ? 'parent' : 'child';
                    return $permission;
                });

            } elseif ($user->activity_scope == 'system_level') {

                $permissions = $user->rolePermissionsQuery()
                    ->whereNull('parent_id')
                    ->with([
                        'childrenRecursive' => function ($query) use ($roleIds) {
                            $query->whereHas('roles', function ($q) use ($roleIds) {
                                $q->whereIn('role_id', $roleIds);
                            })->with([
                                'childrenRecursive' => function ($subQuery) use ($roleIds) {
                                    $subQuery->whereHas('roles', function ($q) use ($roleIds) {
                                        $q->whereIn('role_id', $roleIds);
                                    });
                                }
                            ]);
                        }
                    ])->get();

            } else {

                $permissionsArray = [
                    'dashboard',
                    'Store Settings',
                    PermissionKey::SELLER_STORE_MY_SHOP->value,
                    'Staff control',
                    PermissionKey::SELLER_STORE_STAFF_MANAGE->value,
                ];

                $permissions = $user->rolePermissionsQuery()
                    ->whereIn('name', $permissionsArray)
                    ->whereNull('parent_id')
                    ->with(['children' => function ($query) use ($permissionsArray) {
                        $query->whereIn('name', $permissionsArray);
                    }])
                    ->get();

                $permissions = $permissions->map(function ($permission) {
                    if (is_string($permission->options)) {
                        $permission->options = json_decode($permission->options, true);
                    }

                    if (!empty($permission->children)) {
                        $permission->children = collect($permission->children)->map(function ($child) {
                            if (is_string($child->options)) {
                                $child->options = json_decode($child->options, true);
                            }
                            return $child;
                        });
                    }
                    return $permission;
                });
            }

        } else {

            if ($user->activity_scope === 'store_level' && $user->store_owner === null) {
                $staff_all_permissions = $user->rolePermissionsQuery()->get();
                $permission_lists = [];

                foreach ($staff_all_permissions as $permission) {
                    if (!empty($permission->name)) {
                        $permission_lists[] = $permission->name;
                    }
                }

                $permissionsArray = array_values(array_unique(array_filter($permission_lists)));
            } else {
                $permissionsArray = [
                    'dashboard',
                    PermissionKey::SELLER_STORE_MY_SHOP->value,
                ];
            }

            $permissions = $user->rolePermissionsQuery()
                ->whereIn('name', $permissionsArray)
                ->get()
                ->map(function ($permission) {
                    if (is_string($permission->options)) {
                        $permission->options = json_decode($permission->options, true);
                    }
                    $permission->type = $permission->parent_id === null ? 'parent' : 'child';
                    return $permission;
                });

            $parents = $permissions->filter(fn($p) => $p->parent_id === null)->keyBy('id');
            $children = $permissions->filter(fn($p) => $p->parent_id !== null);

            foreach ($children as $child) {
                if ($parents->has($child->parent_id)) {
                    $child->type = 'child';
                    $parents[$child->parent_id]->children[] = $child;
                }
            }

            $permissions->map(function ($permission) {
                $permission->type = $permission->parent_id === null ? 'parent' : 'child';
                return $permission;
            });
        }

        // ✅ Build tree (ComHelper patch reads language from request safely)
        $filteredPermissions = ComHelper::buildMenuTree(
            $user->roles()->pluck('id')->toArray(),
            $permissions
        );

        // ✅ Keep only true options and remove empty branches (SAFE: no nested function redeclare)
        $final_filteredPermissions = self::filterTrueOnly($filteredPermissions);

        // ✅ Remove root items that are already children somewhere else
        $final_filteredPermissions = self::removeChildDuplicates($final_filteredPermissions);

        return [
            "permissions" => $final_filteredPermissions,
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'phone' => $user->phone,
            'email' => $user->email,
            'activity_scope' => $user->activity_scope,
        ];
    }

    /**
     * Keep only options with value=true; prune nodes with no options and no children.
     * Input/Output structure matches ComHelper tree.
     */
    private static function filterTrueOnly(array $permissions): array
    {
        $out = [];

        foreach ($permissions as $permission) {
            $permission['options'] = array_values(array_filter(
                $permission['options'] ?? [],
                fn($opt) => isset($opt['value']) && $opt['value'] === true
            ));

            if (!empty($permission['children'])) {
                $permission['children'] = self::filterTrueOnly($permission['children']);
            } else {
                $permission['children'] = [];
            }

            if (!empty($permission['options']) || !empty($permission['children'])) {
                $out[] = $permission;
            }
        }

        return $out;
    }

    /**
     * Remove root items that appear as a child ID somewhere else.
     */
    private static function removeChildDuplicates(array $permissions): array
    {
        $childIds = [];
        foreach ($permissions as $permission) {
            if (!empty($permission['children'])) {
                self::collectChildIds($permission['children'], $childIds);
            }
        }

        return array_values(array_filter($permissions, function ($permission) use ($childIds) {
            return !in_array($permission['id'] ?? null, $childIds, true);
        }));
    }

    private static function collectChildIds(array $children, array &$childIds): void
    {
        foreach ($children as $child) {
            if (!empty($child['id'])) {
                $childIds[] = $child['id'];
            }
            if (!empty($child['children'])) {
                self::collectChildIds($child['children'], $childIds);
            }
        }
    }

    // --------- existing methods below unchanged ---------

    // permission false remove in tree
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

    private function filterPermissionsWithAccess($permissions)
    {
        $filtered = [];

        foreach ($permissions as $permission) {
            $filteredOptions = array_filter($permission['options'], function ($option) {
                return $option['value'] === true;
            });

            $filteredChildren = [];
            if (!empty($permission['children'])) {
                $filteredChildren = $this->filterPermissionsWithAccess($permission['children']);
            }

            if (!empty($filteredOptions) || !empty($filteredChildren)) {
                $permission['options'] = array_values($filteredOptions);
                $permission['children'] = $filteredChildren;
                $filtered[] = $permission;
            }
        }

        return $filtered;
    }

    public function roles(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        $roles = collect();

        if ($user->activity_scope === 'store_level') {
            $roles = Role::where('available_for', 'store_level')
                ->where('status', 1)
                ->get();
        }

        return [
            'id' => $user->id,
            'activity_scope' => $user->activity_scope,
            'roles' => SellerRoleResource::collection($roles),
        ];
    }

    public function index(Request $request)
    {
        $limit = $request->limit ?? 10;
        $permissions = QueryBuilder::for(PermissionKey::class)
            ->when($request->filled('available_for'), function ($query) use ($request) {
                $query->where('available_for', $request->available_for);
            })
            ->paginate($limit);

        return PermissionResource::collection($permissions);
    }

    public function moduleWisePermissions(Request $request)
    {
        $permissions = QueryBuilder::for(CustomPermission::class)
            ->when($request->filled('available_for'), function (Builder $query) use ($request) {
                $query->where('available_for', $request->available_for);
            })
            ->whereNull('parent_id')
            ->with('childrenRecursive')
            ->get();

        return ComHelper::buildMenuTree([0], $permissions);
    }

    public function permissionForStoreOwner(Request $request)
    {
        $permission = PermissionKey::findOrFail($request->id);
        $permission->available_for = $permission->available_for === 'system_level' ? 'store_level' : 'system_level';
        $permission->save();

        return response()->json([
            'success' => true,
            'message' => 'PermissionKey for Store Admin toggled successfully',
            'status' => $permission
        ]);
    }
}
