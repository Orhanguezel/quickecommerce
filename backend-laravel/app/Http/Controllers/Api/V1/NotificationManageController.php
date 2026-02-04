<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Notifications\OrderNotificationForAdmin;
use App\Models\UniversalNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;


class NotificationManageController extends Controller
{
    /**
     * Display a listing of the notifications.
     */
    public function listNotifications(Request $request)
    {
        // Check if the user is authenticated as an API user or customer
        $user = auth('api')->user();
        $customer = auth('api_customer')->user();

        // If neither user nor customer is authenticated
        if (!$user && !$customer) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401); // 401 Unauthorized
        }

        // Determine the notifiable_type based on user type
        if ($customer) {
            $notifiableType = 'customer';
        } elseif ($user) {
            $notifiableTypes = [
                'system_level' => 'admin',
                'store_level' => 'store',
                'delivery_level' => 'deliveryman',
            ];
            $notifiableType = $notifiableTypes[$user->activity_scope] ?? 'customer';
        }

        // Build the query based on notifiable type
        $query = UniversalNotification::query();

        if ($notifiableType == 'customer') {
            $query->where('notifiable_type', $notifiableType)->where('notifiable_id', $customer->id);
        } elseif ($notifiableType == 'admin') {
            // admin will see all
        } else {
            $query->where('notifiable_type', $notifiableType)->where('notifiable_id', $user->id);
        }

        if (isset($request->status)) {
            $query->where('status', $request->status);
        }

        if (!empty($request->notifiable_type)) {
            $query->where('notifiable_type', $request->notifiable_type);
        }
        // Paginate results
        $notifications = $query->latest()->paginate($request->per_page ?? 10);

        return response()->json([
            'success' => true,
            'message' => 'List all notifications',
            'data' => OrderNotificationForAdmin::collection($notifications),
            'meta' => new PaginationResource($notifications)
        ]);
    }


    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request)
    {
        try {
            // Attempt to find the notification
            $notification = UniversalNotification::findOrFail($request->id);

            // If notification hasn't been read, mark it as read
            if ($notification->status == 'unread') {
                $notification->update([
                    'status' => 'read'
                ]);
                return response()->json(['message' => 'Notification marked as read']);
            }

            return response()->json(['message' => 'Notification is already marked as read']);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Handle case where notification is not found
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }
    }

    /**
     * Remove the specified notification.
     */
    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'nullable|exists:universal_notifications,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $deleted = UniversalNotification::whereIn('id', $request->ids)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifications deleted successfully',
            'deleted_count' => $deleted,
        ]);
    }

}
