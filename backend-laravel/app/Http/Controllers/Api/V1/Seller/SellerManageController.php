<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Seller\SellerProfileResource;
use App\Interfaces\SellerManageInterface;
use App\Interfaces\StoreManageInterface;
use App\Models\Media;
use App\Models\SellerApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerManageController extends Controller
{
    public function __construct(protected SellerManageInterface $sellerRepo, protected StoreManageInterface $storeRepo)
    {
    }

    public function sellerProfile()
    {
        try {
            if (!auth('sanctum')->check()) {
                return unauthorized_response();
            }

            $userId = auth('sanctum')->id();
            $user = User::findOrFail($userId);

            return response()->json(new SellerProfileResource($user));
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'status_code' => 404,
                'message' => __('messages.data_not_found'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => __('messages.something_went_wrong'),
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string',
            'image' => 'nullable|string',
            'def_lang' => 'nullable|string|max:5',
            // KYC fields
            'business_type' => 'nullable|in:individual,company',
            'company_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'sector' => 'nullable|string|max:255',
            'tax_office' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:100',
            'mersis_number' => 'nullable|string|max:100',
            'website_url' => 'nullable|string|max:255',
            'address_country' => 'nullable|string|max:100',
            'address_city' => 'nullable|string|max:100',
            'address_district' => 'nullable|string|max:100',
            'address_postal_code' => 'nullable|string|max:20',
            'address_line1' => 'nullable|string|max:500',
            'address_line2' => 'nullable|string|max:500',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_holder' => 'nullable|string|max:255',
            'bank_iban' => 'nullable|string|max:50',
            'bank_account_number' => 'nullable|string|max:50',
            'bank_branch_code' => 'nullable|string|max:50',
            'bank_swift_code' => 'nullable|string|max:20',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 422,
                "message" => $validator->errors()
            ]);
        }
        try {
            if (!auth('sanctum')->check()) {
                return unauthorized_response();
            }

            $userId = auth('sanctum')->id();
            $user = User::findOrFail($userId);

            if ($user) {
                $user->update($request->only('first_name', 'last_name', 'phone', 'image', 'def_lang'));
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

                // Update KYC fields in seller_applications if any KYC data provided
                $kycFields = [
                    'business_type',
                    'company_name', 'brand_name', 'sector', 'tax_office', 'tax_number',
                    'mersis_number', 'website_url', 'address_country', 'address_city',
                    'address_district', 'address_postal_code', 'address_line1', 'address_line2',
                    'bank_name', 'bank_account_holder', 'bank_iban', 'bank_account_number',
                    'bank_branch_code', 'bank_swift_code',
                ];
                $kycData = $request->only($kycFields);
                if (!empty(array_filter($kycData, fn($v) => $v !== null && $v !== ''))) {
                    $application = SellerApplication::where('user_id', $userId)->latest()->first();
                    if ($application) {
                        // Reset to pending if key identity/bank fields changed
                        $sensitiveFields = ['business_type', 'tax_number', 'bank_iban', 'bank_account_holder'];
                        $sensitiveChanged = collect($sensitiveFields)
                            ->contains(fn($f) => $request->filled($f) && $request->input($f) !== $application->{$f});
                        $application->update($kycData);
                        if ($sensitiveChanged) {
                            $application->update(['status' => SellerApplication::STATUS_PENDING, 'admin_note' => null]);
                        }
                    } else {
                        SellerApplication::create(array_merge($kycData, [
                            'user_id' => $userId,
                            'status' => SellerApplication::STATUS_PENDING,
                        ]));
                    }
                }

                return response()->json([
                    'status' => true,
                    'status_code' => 200,
                    'message' => __('messages.update_success', ['name' => 'Seller']),
                ]);

            } else {
                return response()->json([
                    'status' => true,
                    'status_code' => 500,
                    'message' => __('messages.update_failed', ['name' => 'Seller']),
                ]);
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'status_code' => 404,
                'message' => __('messages.data_not_found'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => __('messages.something_went_wrong'),
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function sendVerificationEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 500,
                "message" => $validator->errors()
            ]);
        }
        try {
            $result = $this->sellerRepo->sendVerificationEmail($request->email);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'status_code' => 500,
                    'message' => __('messages.data_not_found')
                ], 404);
            }
            return response()->json(['status' => true, 'message' => 'Verification email sent.']);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function verifyEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $result = $this->sellerRepo->verifyEmail($request->token);

        if (!$result) {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.token.invalid')
            ], 400);
        }

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => __('messages.email.verify.success')
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 500,
                "message" => $validator->errors()
            ]);
        }
        try {
            $result = $this->sellerRepo->resendVerificationEmail($request->email);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'status_code' => 500,
                    'message' => __('messages.email.resend.failed')
                ], 500);
            }

            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.email.resend.success')
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function forgetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 500,
                "message" => $validator->errors()
            ]);
        }
        try {
            $result = $this->sellerRepo->sendVerificationEmail($request->email);

            if (!$result) {
                return response()->json([
                    'status' => false,
                    'status_code' => 500,
                    'message' => __('messages.data_not_found')
                ], 404);
            }
            return response()->json(['status' => true, 'message' => 'Verification email sent.']);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }

    public function verifyToken(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 500,
                "message" => $validator->errors()
            ]);
        }

        $result = $this->sellerRepo->verifyToken($request->token);

        if (!$result) {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.token.invalid')
            ], 400);
        }

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => __('messages.token.verified')
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|confirmed',
            'token' => 'required|string'
        ]);
        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 500,
                "message" => $validator->errors()
            ]);
        }
        $result = $this->sellerRepo->resetPassword($request->all());

        if (!$result) {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => __('messages.token.invalid')
            ], 400);
        }

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => __('messages.password_update_successful')
        ]);
    }

    public function updateEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email,' . $request->id,
        ]);
        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }
        try {
            if (!auth('sanctum')->check()) {
                return unauthorized_response();
            }
            $userId = auth('sanctum')->id();
            $user = User::findOrFail($userId);
            if ($user && !$user->email_verify_token) {
                $user->update($request->only('email'));
                return response()->json([
                    'status' => true,
                    'status_code' => 200,
                    'message' => __('messages.update_success', ['name' => 'User']),
                ]);
            } else {
                return response()->json([
                    'status' => true,
                    'status_code' => 500,
                    'message' => __('messages.update_failed', ['name' => 'User']),
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => __('messages.something_went_wrong'),
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function deactivateAccount()
    {
        if (!auth('api')->check()) {
            unauthorized_response();
        }
        $userId = auth('api')->user()->id;
        if (runningOrderExists($userId)) {
            return response()->json([
                'message' => __('messages.has_running_orders', ['name' => 'Seller'])
            ]);
        }
        $success = $this->sellerRepo->deactivateAccount();
        if ($success) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.account_deactivate_successful')
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => __('messages.account_deactivate_failed')
            ]);
        }
    }

    public function deleteAccount()
    {
        if (!auth('api')->check()) {
            unauthorized_response();
        }
        $userId = auth('api')->user()->id;
        if (runningOrderExists($userId)) {
            return response()->json([
                'message' => __('messages.has_running_orders', ['name' => 'Seller'])
            ]);
        }
        $success = $this->storeRepo->deleteSellerRelatedAllData(auth('api')->user()->id);
        if ($success) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.account_delete_successful')
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => __('messages.account_delete_failed')
            ]);
        }
    }
}
