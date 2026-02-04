<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Admin\SellerListForDropdownResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Dashboard\SellerStoreSummaryResource;
use App\Http\Resources\Seller\SellerDetailsResource;
use App\Http\Resources\Seller\SellerResource;
use App\Interfaces\StoreManageInterface;
use App\Models\Media;
use App\Models\User;
use App\Services\TrashService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminSellerManageController extends Controller
{
    private $trashService;

    public function __construct(protected StoreManageInterface $storeRepo, TrashService $trashService)
    {
        $this->trashService = $trashService;
    }

    public function listSellers(Request $request)
    {
        $query = User::isSeller();

        if (isset($request->status)) {
            $query->where('status', $request->status);
        }
        if (isset($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', '%' . $request->search . '%')
                    ->orWhere('last_name', 'like', '%' . $request->search . '%')
                    ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }
        $sellers = $query
            ->where('deleted_at', null)
            ->latest()
            ->paginate($request->per_page ?? 10);
        return response()->json([
            'sellers' => SellerResource::collection($sellers),
            'meta' => new PaginationResource($sellers),
        ]);
    }

    public function listActiveSellers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'search' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $query = User::isSeller()
            ->whereNull('deleted_at')
            ->where('status', 1);

        if ($request->filled('search')) {
            $query->where('first_name', 'like', '%' . $request->search . '%')
                ->orWhere('last_name', 'like', '%' . $request->search . '%');
        }

        $sellers = $query->orderBy('first_name')
            ->limit(50)
            ->get();

        return response()->json(SellerListForDropdownResource::collection($sellers));
    }

    public function getSellerById(Request $request)
    {
        $seller = User::isSeller()->where('id', $request->id)->first();
        if ($seller) {
            return response()->json(new SellerDetailsResource($seller));
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ]);
        }
    }

    // Approve Seller
    public function approveSeller(Request $request)
    {
        $seller = User::isSeller()->findOrFail($request->id);
        $seller->update(['status' => 1]); // 1=Active
        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => __('messages.approve.success', ['name' => 'Seller'])
        ]);
    }

    // Reject Seller
    public function rejectSeller(Request $request)
    {
        $seller = User::isSeller()->findOrFail($request->id);
        $seller->update(['status' => 2]); // 2=Suspended
        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => __('messages.reject.success', ['name' => 'Seller'])
        ]);
    }

    // Get Pending Sellers
    public function listPendingSellers()
    {
        $sellers = User::isSeller()
            ->where('status', 0)
            ->where('deleted_at', null)
            ->paginate(10); // 0=Inactive
        return response()->json([
            'sellers' => SellerResource::collection($sellers),
            'meta' => new PaginationResource($sellers),
        ]);
    }

    public function changeSellerStatus(Request $request)
    {
        $user = User::findOrFail($request->id);
        $user->status = $request->status;
        $user->save();
        return $this->success(translate('messages.update_success', ['name' => 'User']));
    }

    public function deleteSellers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seller_ids' => 'required|array|min:1',
            'seller_ids.*' => 'exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $failed = [];
        $runningOrderExists = [];
        foreach ($request->seller_ids as $seller_id) {
            $seller = User::find($seller_id);
            if (!$seller) {
                $failed[] = $seller_id;
                continue;
            }
            if (runningOrderExists(null, $seller_id)) {
                $runningOrderExists[] = $seller_id;
                continue;
            }

            $success = $this->storeRepo->deleteSellerRelatedAllData($seller_id);
            if (!$success) {
                $failed[] = $seller_id;
            }
        }

        if (count($failed)) {
            return response()->json([
                'message' => __('messages.partial_delete_failed', ['name' => 'Seller']),
                'failed_ids' => $failed,
            ], 207); // 207 Multi-Status (partial success)
        }
        if (count($runningOrderExists)) {
            return response()->json([
                'message' => __('messages.has_running_orders', ['name' => implode(', ', $runningOrderExists) . 'sellers'])
            ]);
        }

        return response()->json([
            'message' => __('messages.delete_success', ['name' => 'Sellers']),
        ]);
    }

    public function changeSellerPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:users,id',
            'password' => 'required|string|min:8|max:32'
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $user = User::find($request->id);
        if (!$user) {
            return response()->json([
                'message' => __('messages.data_not_found'),
            ], 404);
        }
        if ($user->store_owner == 0) {
            return response()->json([
                'message' => __('messages.user_invalid', ['user' => 'Seller'])
            ], 422);
        }
        $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
        $user->save();
        return response()->json([
            'message' => __('messages.update_success', ['name' => 'Password']),
        ]);
    }

    public function updateSellerProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:users,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $request->id,
            'phone' => 'nullable|string',
            'image' => 'nullable'
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }


        $user = User::find($request->id);
        if (!$user) {
            return response()->json([
                'message' => __('messages.data_not_found'),
            ], 404);
        }
        if ($user->store_owner == 0) {
            return response()->json([
                'message' => __('messages.user_invalid', ['user' => 'Seller'])
            ], 422);
        }

        $user->update($request->only('first_name', 'last_name', 'phone', 'email', 'image'));
        //Set up media binding for main image
        if (!empty($user->image)) {
            $mainImage = Media::find($user->image);
            if ($mainImage) {
                $mainImage->update([
                    'user_id' => $user->id,
                    'user_type' => User::class,
                    'usage_type' => 'seller_profile',
                ]);
            }
        }
        return response()->json([
            'message' => __('messages.update_success', ['name' => 'Seller'])
        ]);
    }

    public function sellerDashboard(Request $request)
    {
        $validator = Validator::make(['id' => $request->id, 'slug' => $request->slug], [
            'id' => 'required|exists:users,id',
            'slug' => 'nullable|exists:stores,slug',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $seller = User::where('id', $request->id)->where('activity_scope', 'store_level')->first();
        if (!$seller) {
            return response()->json([
                'message' => __('messages.user_invalid', ['user' => 'seller'])
            ], 422);
        }
        $data = $this->storeRepo->getSummaryData($request->slug, $request->id);
        return response()->json(new SellerStoreSummaryResource((object)$data));
    }

    public function getSellerTrashList(Request $request)
    {
        $trash = $this->trashService->listTrashed('seller', $request->per_page ?? 10);
        return response()->json([
            'data' => SellerResource::collection($trash),
            'meta' => new PaginationResource($trash)
        ]);
    }

    public function restoreSellerTrashed(Request $request)
    {
        $ids = $request->ids;
        $restored = $this->trashService->restore('seller', $ids);
        return response()->json([
            'message' => __('messages.restore_success', ['name' => 'Sellers']),
            'restored' => $restored,
        ]);
    }

    public function deleteSellerTrashed(Request $request)
    {
        $ids = $request->ids;
        $deleted = $this->trashService->forceDelete('seller', $ids);
        return response()->json([
            'message' => __('messages.force_delete_success', ['name' => 'Sellers']),
            'deleted' => $deleted,
        ]);
    }
}
