<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\ImageModifier;
use App\Helpers\ComHelper;
use App\Http\Controllers\Api\V1\Controller;
use App\Models\Store;
use App\Models\User;
use App\Repositories\UserRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class PartnerLoginController extends Controller
{

    public $repository;

    public function __construct(UserRepository $repository)
    {
        $this->repository = $repository;
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:8|max:32',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors());
        }

        $user = User::where('email', $request->email)
            ->where('activity_scope', 'store_level')
            ->where('status', 1)
            ->first();

        if (!$user) {
            return response()->json([
                "status" => false,
                "status_code" => 422,
                "message" => 'User is not a seller!',
            ], 422);
        }


        // Check if the user's account is deleted
        if ($user->deleted_at !== null) {
            return response()->json([
                'error' => 'Your account has been deleted. Please contact support.'
            ], Response::HTTP_GONE); // HTTP 410 Gone
        }
        // Check if the user's account is deactivated or disabled
        if ($user->status === 0) {
            return response()->json([
                'error' => 'Your account has been deactivated. Please contact support.'
            ], Response::HTTP_FORBIDDEN); // HTTP 403 Forbidden
        }
        if ($user->status === 2) {
            return response()->json([
                'error' => 'Your account has been suspended by the admin.'
            ], Response::HTTP_FORBIDDEN); // HTTP 403 Forbidden
        }
        if (!$user || !Hash::check($request->password, $user->password)) {
            return ["success" => false, "token" => null, "permissions" => []];
        }
        $email_verified = $user->hasVerifiedEmail();
        if (is_string($user->stores)) {
            $storeIds = json_decode($user->stores, true); // Decodes JSON string to an array
        } elseif (is_array($user->stores)) {
            $storeIds = $user->stores; // It's already an array, no decoding needed
        } else {
            $storeIds = []; // Default to an empty array if the type is neither string nor array
        }
        if (!is_null($storeIds) && is_array($storeIds)) {
            $stores = Store::whereIn('id', $storeIds)
                ->select(['id', 'name', 'store_type'])
                ->get()
                ->toArray();
        } else {
            $stores = [];
        }
        // Handle the "Remember Me" option
        $remember_me = $request->has('remember_me');

        // Set token expiration dynamically
        config(['sanctum.expiration' => $remember_me ? null : 1440]);

        $token = $user->createToken('auth_token');
        $accessToken = $token->accessToken;
        $accessToken->expires_at = Carbon::now()->addMinutes((int)1440);
        $accessToken->save();

        // update firebase device token
        $user->update([
            'firebase_token' => $request->firebase_device_token,
        ]);


        return [
            "success" => true,
            "message" => __('messages.login_success'),
            "token" => $token->plainTextToken,
            'expires_at' => $accessToken->expires_at->format('Y-m-d H:i:s'),
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            "email_verification_settings" => com_option_get('com_user_email_verification', null, false) ?? 'off',
            'phone' => $user->phone,
            'image_url' => ImageModifier::generateImageUrl($user->image),
            "email_verified" => (bool)$user->email_verified,
            "store_owner" => $user->store_owner,
            "store_seller_id" => $user->store_seller_id,
            "stores" => $stores,
            "role" => $user->getRoleNames()

        ];
    }

    public function refreshToken(Request $request)
    {
        $plainToken = $request->bearerToken();

        if (!$plainToken) {
            return response()->json([
                'status' => false,
                'message' => 'Access token missing.',
            ], 401);
        }

        $tokenId = explode('|', $plainToken)[0];

        $token = PersonalAccessToken::find($tokenId);

        if (!$token) {
            return response()->json([
                'status' => false,
                'message' => 'Token not found.',
            ], 401);
        }
        $user = $token->tokenable;


        if ($token->expires_at && Carbon::parse($token->expires_at)->lt(now())) {

            $token->delete();
            $newToken = $user->createToken('auth_token');
            $accessToken = $newToken->accessToken;
            $accessToken->expires_at = now()->addMinutes((int)config('sanctum.expiration', 60));
            $accessToken->save();

            return response()->json([
                'status' => true,
                'message' => 'Token refreshed.',
                'token' => $newToken->plainTextToken,
                'new_expires_at' => $accessToken->expires_at?->format('Y-m-d H:i:s'),
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Token is still valid.',
            'token' => $plainToken,
            'expires_at' => $token->expires_at?->format('Y-m-d H:i:s'),
        ]);
    }

    public static function buildMenuTree($data_list)
    {
        $tree = [];
        foreach ($data_list as $data_item) {

            if (isset($data_item->children)) {
                $children = $data_item->children->count() ? ComHelper::buildMenuTree($data_item->children) : [];
                $tree[] = [
                    'id' => $data_item->id,
                    'perm_title' => $data_item->perm_title,
                    'children' => $children,
                ];
            }
        }
        return $tree;
    }

}
