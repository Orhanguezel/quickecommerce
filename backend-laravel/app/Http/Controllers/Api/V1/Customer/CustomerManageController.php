<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\CustomerRequest;
use App\Http\Resources\Customer\CustomerDashboardResource;
use App\Http\Resources\Customer\CustomerProfileResource;
use App\Interfaces\CustomerManageInterface;
use App\Mail\EmailVerificationMail;
use App\Models\Customer;
use App\Models\CustomerDeactivationReason;
use App\Models\UniversalNotification;
use App\Models\EmailVerificationCode;
use App\Models\Wishlist;
use App\Rules\ValidCustomerPhone;
use App\Services\EmailVerificationCodeService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CustomerManageController extends Controller
{
    public function __construct(
        protected CustomerManageInterface $customerRepo,
        protected EmailVerificationCodeService $verificationCodes,
    ) {
    }

    public function registerCustomer(CustomerRequest $request)
    {
        try {
            $customer = Customer::create($request->all());
            $token = $customer->createToken('customer_auth_token')->plainTextToken;

            // Yeni uyelik -> admine bildir (panel cani + e-posta). Bildirim
            // hatasi kayit akisini bozmaz (AdminNotifier kendi icinde yutar).
            $fullName = trim(($customer->first_name ?? '') . ' ' . ($customer->last_name ?? ''));
            \App\Services\AdminNotifier::notify(
                'Yeni uyelik',
                ($fullName !== '' ? $fullName : 'Yeni musteri') . ' kayit oldu (' . $customer->email . ')',
                [
                    'type' => 'new_customer',
                    'customer_id' => $customer->id,
                    'email' => $customer->email,
                    'screen' => 'customers',
                ],
                true
            );

            // E-posta dogrulama aciksa kayit biter bitmez 6 haneli kodu yolla.
            // Onceden hicbir yerde tetiklenmiyordu: ayar acilsa bile kimseye
            // kod gitmedigi icin kullanici hesabina giremez hale gelirdi.
            $verificationEnabled = EmailVerificationCodeService::accountVerificationEnabled();
            $verificationSent = false;

            if ($verificationEnabled) {
                // Kod gonderilemezse kayit yine de basarili sayilir; kullanici
                // dogrulama ekranindan "tekrar gonder" diyebilir.
                $issued = $this->verificationCodes->issue(
                    $customer->email,
                    EmailVerificationCode::PURPOSE_ACCOUNT,
                    $customer->first_name,
                    $request->ip()
                );
                $verificationSent = $issued['ok'];
            }

            // Return a successful response with the token and permissions
            return response()->json([
                "status" => true,
                "status_code" => 200,
                "message" => __('messages.register_successful'),
                "token" => $token,
                "email" => $customer->email,
                "email_verified" => (bool)$customer->email_verified,
                "email_verification_settings" => $verificationEnabled ? 'on' : 'off',
                "verification_code_sent" => $verificationSent,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                "status" => false,
                "status_code" => 500,
                "message" => $e->getMessage()
            ]);
        }
    }

    /**
     * Misafir checkout icin e-posta dogrulama kodu gonderir.
     *
     * Sahte siparis korumasi (bkz. siparis #204: "adawd awdawd" /
     * awdawd@gmail.com / 535788754541): artik siparis kaydi olusmadan once
     * e-posta adresinin gercekten kullanicinin olduguna dair 6 haneli kod
     * dogrulanir.
     */
    public function sendGuestCheckoutCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191',
            'first_name' => 'nullable|string|max:100',
            'phone' => ['nullable', new ValidCustomerPhone()],
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!EmailVerificationCodeService::guestVerificationEnabled()) {
            // Ayar kapaliysa istemci kod adimini atlar.
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'verification_required' => false,
                'message' => 'Doğrulama gerekmiyor.',
            ]);
        }

        $email = mb_strtolower(trim((string) $request->email));

        // Kayitli (uye) bir hesabin adresine misafir kodu gondermeyelim;
        // kullaniciyi bosuna kod bekletmek yerine girise yonlendir.
        $registered = Customer::where('email', $email)->where('is_guest', 0)->exists();
        if ($registered) {
            return response()->json([
                'status' => false,
                'status_code' => 409,
                'code' => 'email_registered',
                'message' => 'Bu e-posta ile kayıtlı bir hesap var. Lütfen giriş yapın.',
            ], 409);
        }

        $result = $this->verificationCodes->issue(
            $email,
            EmailVerificationCode::PURPOSE_GUEST_CHECKOUT,
            $request->input('first_name'),
            $request->ip()
        );

        return response()->json([
            'status' => $result['ok'],
            'status_code' => $result['ok'] ? 200 : 429,
            'code' => $result['code'],
            'verification_required' => true,
            'email' => $email,
            'retry_after' => $result['retry_after'],
            'message' => $result['message'],
        ], $result['ok'] ? 200 : ($result['code'] === 'send_failed' ? 500 : 429));
    }

    /**
     * Misafir (guest) checkout: uyeliksiz siparis. E-posta/ad/telefon alir,
     * hafif bir musteri hesabi (is_guest=1, rastgele sifre) olusturur ve token
     * doner — boylece mevcut checkout/odeme akisi hic degismeden calisir.
     *
     * Guvenlik: kayitli (is_guest=0) bir hesabin e-postasiyla guest girisi
     * VERILMEZ (sifresiz baskasinin hesabina girilemesin) -> giris yonlendirilir.
     * Ayni e-postayla onceki guest hesap tekrar kullanilir (iletisim guncellenir).
     *
     * 2026-08-22: e-posta dogrulama kodu ('code') ve gercek telefon
     * dogrulamasi zorunlu hale getirildi (sahte siparis #204).
     */
    public function guestCheckout(Request $request)
    {
        $verificationRequired = EmailVerificationCodeService::guestVerificationEnabled();

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191',
            'first_name' => 'required|string|max:100',
            'last_name' => 'nullable|string|max:100',
            'phone' => ['required', 'string', 'max:32', new ValidCustomerPhone()],
            'code' => [$verificationRequired ? 'required' : 'nullable', 'string', 'max:16'],
        ], [
            'code.required' => 'Lütfen e-postanıza gönderilen 6 haneli doğrulama kodunu girin.',
            'email.required' => 'E-posta adresi zorunludur.',
            'email.email' => 'Geçerli bir e-posta adresi giriniz.',
            'first_name.required' => 'Ad zorunludur.',
            'phone.required' => 'Telefon numarası zorunludur.',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $email = strtolower(trim((string) $request->email));
            $phone = trim((string) $request->phone);

            if ($verificationRequired) {
                $result = $this->verificationCodes->verify(
                    $email,
                    EmailVerificationCode::PURPOSE_GUEST_CHECKOUT,
                    (string) $request->input('code')
                );

                if (!$result['ok']) {
                    return response()->json([
                        'status' => false,
                        'status_code' => 422,
                        'code' => $result['code'],
                        'message' => $result['message'],
                    ], 422);
                }
            }

            // email/phone ikisi de UNIQUE -> ikisinden biri eslesirse mevcut
            // musteriyi bul (donen misafir ayni telefonu/e-postayi kullanabilir).
            $existing = Customer::where('email', $email)->orWhere('phone', $phone)->first();

            if ($existing && !$existing->is_guest) {
                return response()->json([
                    'status' => false,
                    'status_code' => 409,
                    'code' => 'email_registered',
                    'message' => 'Bu e-posta veya telefon ile kayıtlı bir hesap var. Lütfen giriş yapın.',
                ], 409);
            }

            // Dogrulanan adres ile eslesmeyen bir kayda (telefon uzerinden
            // bulunan baska bir misafir) kod ile giris verilmesin.
            if ($verificationRequired && $existing && mb_strtolower((string) $existing->email) !== $email) {
                return response()->json([
                    'status' => false,
                    'status_code' => 409,
                    'code' => 'phone_in_use',
                    'message' => 'Bu telefon numarası başka bir e-posta ile kullanılıyor. Lütfen o e-posta ile devam edin.',
                ], 409);
            }

            if ($existing) {
                // Mevcut misafir hesabi -> tekrar kullan. email/phone UNIQUE
                // oldugu icin onlara dokunma; yalniz isim (unique degil) guncelle.
                $existing->update([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name ?? $existing->last_name,
                ]);
                $customer = $existing;
            } else {
                $customer = Customer::create([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name ?? '',
                    'email' => $email,
                    'phone' => $phone,
                    'password' => Hash::make(Str::random(40)),
                    'is_guest' => true,
                    'verified' => 0,
                    'status' => 1,
                ]);
            }

            // Kod ile ispatlandi -> misafir hesabin e-postasi dogrulanmis sayilir.
            if ($verificationRequired && !$customer->email_verified) {
                $customer->forceFill([
                    'email_verified' => 1,
                    'email_verified_at' => now(),
                ])->save();
            }

            $token = $customer->createToken('customer_guest_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => 'Misafir olarak devam ediliyor.',
                'token' => $token,
                'email' => $customer->email,
                'email_verified' => (bool) $customer->email_verified,
                'email_verification_settings' => 'off',
                'is_guest' => true,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function loginCustomer(Request $request)
    {
        if ($request->boolean('social_login')) {
            return $this->socialLoginCustomer($request);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|max:32',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "message" => $validator->errors()
            ], 422);
        }

        $customer = Customer::where('email', $request->email)
            ->first();

        if (!$customer) {
            return response()->json([
                "status" => false,
                "message" =>__('messages.customer.not.found'),
            ], 404);
        }

        // update firebase device token
        $customer->update([
            'firebase_token' => $request->firebase_device_token,
        ]);

        // Check if the user's account is deleted
        if ($customer->deleted_at !== null) {
            return response()->json([
                'error' => 'Your account has been deleted. Please contact support.'
            ], Response::HTTP_GONE); // HTTP 410 Gone
        }
        // Check if the user's account is deactivated or disabled
        if ($customer->status === 0) {
            return response()->json([
                'error' => 'Your account has been deactivated. Please contact support.'
            ], Response::HTTP_FORBIDDEN); // HTTP 403 Forbidden
        }
        if ($customer->status === 2) {
            return response()->json([
                'error' => 'Your account has been suspended by the admin.'
            ], Response::HTTP_FORBIDDEN); // HTTP 403 Forbidden
        }
        $authCustomer = Hash::check($request->password, $customer->password);
        // Check if the user exists and if the password is correct
        if (!$authCustomer) {
            return response()->json([
                "status" => false,
                "message" => __('messages.wrong_credential'),
                "token" => null,
            ], 422);
        } else {
            // Handle the "Remember Me" option
            $remember_me = $request->has('remember_me');

            // Set token expiration dynamically
            config(['sanctum.expiration' => $remember_me ? null : 1440]);

            $token = $customer->createToken('customer_auth_token');
            $accessToken = $token->accessToken;
            $accessToken->expires_at = Carbon::now()->addMinutes((int)1440);
            $accessToken->save();

            // update firebase device token
            $customer->update([
                'firebase_token' => $request->firebase_device_token,
            ]);

            return response()->json([
                "status" => true,
                "status_code" => 200,
                "message" => __('messages.login_success'),
                "token" => $token->plainTextToken,
                "email" => $customer->email,
                'expires_at' => $accessToken->expires_at->format('Y-m-d H:i:s'),
                "email_verified" => (bool)$customer->email_verified, // shorthand of -> $token->email_verified ? true : false
                "email_verification_settings" => com_option_get('com_user_email_verification',null,false) ?? 'off',
                "account_status" => $customer->deactivated_at ? 'deactivated' : 'active',
                "marketing_email" => (bool)$customer->marketing_email,
                "activity_notification" => (bool)$customer->activity_notification,
            ]);
        }
    }

    protected function socialLoginCustomer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'access_token' => 'required|string',
            'type' => 'required|string|in:google,facebook',
            'firebase_device_token' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "message" => $validator->errors(),
            ], 422);
        }

        $type = $request->input('type');
        $profile = $type === 'google'
            ? verifyGoogleToken($request->input('access_token'))
            : verifyFacebookToken($request->input('access_token'));

        if (!$profile || empty($profile['id']) || empty($profile['email'])) {
            return response()->json([
                "status" => false,
                "message" => __('messages.invalid_token'),
            ], 422);
        }

        $socialColumn = $type . '_id';
        $customer = Customer::where($socialColumn, $profile['id'])
            ->orWhere('email', $profile['email'])
            ->first();

        if ($customer && $customer->deleted_at !== null) {
            return response()->json([
                'error' => 'Your account has been deleted. Please contact support.',
            ], Response::HTTP_GONE);
        }

        if ($customer && $customer->status === 0) {
            return response()->json([
                'error' => 'Your account has been deactivated. Please contact support.',
            ], Response::HTTP_FORBIDDEN);
        }

        if ($customer && $customer->status === 2) {
            return response()->json([
                'error' => 'Your account has been suspended by the admin.',
            ], Response::HTTP_FORBIDDEN);
        }

        $name = trim($profile['name'] ?? '');
        [$firstName, $lastName] = array_pad(preg_split('/\s+/', $name, 2), 2, null);

        if (!$customer) {
            $customer = Customer::create([
                'first_name' => $firstName ?: $profile['email'],
                'last_name' => $lastName,
                'email' => $profile['email'],
                $socialColumn => $profile['id'],
                'email_verified' => 1,
                'email_verified_at' => Carbon::now(),
                'firebase_token' => $request->input('firebase_device_token'),
                'password' => Hash::make(Str::random(32)),
                'status' => 1,
            ]);
        } else {
            $customer->update([
                $socialColumn => $profile['id'],
                'email_verified' => 1,
                'email_verified_at' => $customer->email_verified_at ?? Carbon::now(),
                'firebase_token' => $request->input('firebase_device_token'),
            ]);
        }

        $token = $customer->createToken('customer_social_auth_token');
        $accessToken = $token->accessToken;
        $accessToken->expires_at = Carbon::now()->addMinutes((int)1440);
        $accessToken->save();

        return response()->json([
            "status" => true,
            "status_code" => 200,
            "message" => __('messages.login_success'),
            "token" => $token->plainTextToken,
            "expires_at" => $accessToken->expires_at->format('Y-m-d H:i:s'),
            "user" => new CustomerProfileResource($customer),
            "email" => $customer->email,
            "email_verified" => (bool)$customer->email_verified,
            "email_verification_settings" => com_option_get('com_user_email_verification', null, false) ?? 'off',
            "account_status" => $customer->deactivated_at ? 'deactivated' : 'active',
            "marketing_email" => (bool)$customer->marketing_email,
            "activity_notification" => (bool)$customer->activity_notification,
        ]);
    }

    public function refreshToken(Request $request)
    {
        $plainToken = $request->bearerToken();
        if (!$plainToken || $plainToken == 'null') {
            return response()->json([
                'status' => false,
                'message' => 'Access token missing.',
            ], 401);
        }

        // Extract token id from "id|token"
        $tokenId = explode('|', $plainToken)[0];
        $token = PersonalAccessToken::find($tokenId);
        if (!$token) {
            return response()->json([
                'status' => false,
                'message' => 'Token not found.',
            ], 404);
        }

        $user = $token->tokenable;

        if ($token->expires_at && Carbon::parse($token->expires_at)->lt(now())) {
            $token->delete();
            $newToken = $user->createToken('customer_auth_token');
            $accessToken = $newToken->accessToken;
            $accessToken->expires_at = now()->addMinutes((int)1440);
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

    /**
     * Uyelik e-posta dogrulamasi: kullanici kendi e-postasina gelen 6 haneli
     * kodu girer.
     *
     * Eski surum kodu GLOBAL ariyordu (Customer::where('email_verify_token', $token))
     * — yani 6 haneli bir kod, hangi hesaba aitse onu dogruluyordu ve o kolon
     * sifre sifirlama ile paylasimliydi. Artik kod, oturum acmis musterinin
     * e-postasina + 'account' amacina bagli olarak dogrulanir.
     */
    public function verifyEmail(Request $request)
    {
        $customer = auth('api_customer')->user();
        if (!$customer) {
            return unauthorized_response();
        }

        $validator = Validator::make($request->all(), [
            // Eski istemciler 'token' yolluyordu, geriye donuk kabul ediyoruz.
            'code' => 'required_without:token|nullable|string|max:16',
            'token' => 'required_without:code|nullable|string|max:16',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($customer->email_verified) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'email_verified' => true,
                'message' => 'E-posta adresiniz zaten doğrulanmış.',
            ]);
        }

        $result = $this->verificationCodes->verify(
            $customer->email,
            EmailVerificationCode::PURPOSE_ACCOUNT,
            (string) ($request->input('code') ?? $request->input('token'))
        );

        if (!$result['ok']) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'code' => $result['code'],
                'email_verified' => false,
                'message' => $result['message'],
            ], 422);
        }

        $customer->forceFill([
            'email_verified' => 1,
            'email_verified_at' => now(),
            'verified' => 1,
            'email_verify_token' => null,
        ])->save();

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'email_verified' => true,
            'message' => 'E-posta adresiniz doğrulandı.',
        ]);
    }

    /**
     * Dogrulama kodunu tekrar gonder.
     *
     * Onceden govdedeki 'email' alanina ne yazilirsa oraya mail atiyordu
     * (oturum acmis herkes istedigi adrese mail attirabiliyordu). Artik
     * hedef her zaman oturum acmis musterinin kendi e-postasidir.
     */
    public function resendVerificationEmail(Request $request)
    {
        return $this->issueAccountVerificationCode($request);
    }

    private function issueAccountVerificationCode(Request $request)
    {
        $customer = auth('api_customer')->user();
        if (!$customer) {
            return unauthorized_response();
        }

        if ($customer->email_verified) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'email_verified' => true,
                'message' => 'E-posta adresiniz zaten doğrulanmış.',
            ]);
        }

        $result = $this->verificationCodes->issue(
            $customer->email,
            EmailVerificationCode::PURPOSE_ACCOUNT,
            $customer->first_name,
            $request->ip()
        );

        return response()->json([
            'status' => $result['ok'],
            'status_code' => $result['ok'] ? 200 : 429,
            'code' => $result['code'],
            'email' => $customer->email,
            'retry_after' => $result['retry_after'],
            'message' => $result['message'],
        ], $result['ok'] ? 200 : ($result['code'] === 'send_failed' ? 500 : 429));
    }

    public function sendPasswordResetToken(Request $request)
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
            $result = $this->customerRepo->sendVerificationEmail($request->email);

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

    public function verifyPasswordResetToken(Request $request)
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

        $result = $this->customerRepo->verifyToken($request->token);

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
            'password' => 'required|string|confirmed',
            'token' => 'required|string'
        ]);
        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 500,
                "message" => $validator->errors()
            ]);
        }
        $result = $this->customerRepo->resetPassword($request->all());

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

    public function changeCustomerPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'old_password' => 'required|string',
            'new_password' => 'required|string|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 422,
                "message" => $validator->errors()
            ], 422);
        }

        $result = $this->customerRepo->changePassword($request->only(['old_password', 'new_password']));

        if ($result === 'incorrect_old_password') {
            return response()->json([
                'status' => false,
                'status_code' => 400,
                'message' => 'Incorrect password!'
            ], 400);
        }

        if (!$result) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => __('messages.password_update_failed')
            ], 500);
        }

        return response()->json([
            'status' => true,
            'status_code' => 200,
            'message' => __('messages.password_update_successful')
        ]);
    }


    public function customerProfile()
    {
        try {
            if (!auth('api_customer')->check()) {
                return unauthorized_response();
            }

            $userId = auth('api_customer')->id();
            $user = Customer::findOrFail($userId);

            // count unread customer notification
            $unreadNotifications = UniversalNotification::forCustomers()
                ->where('notifiable_id', $userId)
                ->where('status', 'unread')
                ->count();

            $wishlist_count = Wishlist::where('customer_id', $userId)->count();

            $user->unread_notifications = $unreadNotifications;
            $user->wishlist_count = $wishlist_count;

            return new CustomerProfileResource($user);
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

    public function updateCustomerProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string',
            'image' => 'nullable|string',
            'birth_day' => 'nullable|date|date_format:Y-m-d',
            'gender' => 'nullable|string|in:male,female,others',
        ]);

        if ($validator->fails()) {
            return response()->json([
                "status" => false,
                "status_code" => 422,
                "message" => $validator->errors()
            ]);
        }
        try {
            if (!auth('api_customer')->check()) {
                return unauthorized_response();
            }

            $userId = auth('api_customer')->id();
            $user = Customer::findOrFail($userId);

            if ($user) {
                $user->update($request->only('first_name', 'last_name', 'phone', 'image', 'birth_day', 'gender'));
                return response()->json([
                    'status' => true,
                    'status_code' => 200,
                    'message' => __('messages.update_successful'),
                ]);
            } else {
                return response()->json([
                    'status' => true,
                    'status_code' => 500,
                    'message' => __('messages.update_failed', ['name' => 'Customer']),
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

    /**
     * Dogrulama kodunu gonder.
     *
     * Iki senaryo:
     *  - Govdede e-posta yok / mevcut e-posta ile ayni -> hesap dogrulama kodu.
     *  - Govdede FARKLI bir e-posta var -> e-posta degistirme kodu, YENI
     *    adrese gider (Flutter uygulamasinin "e-posta degistir" akisi boyle
     *    calisiyor: once buraya yeni adres, sonra profile/change-email).
     *
     * Her iki durumda da hedef adres kullanicinin kendi hesabina baglidir;
     * eskiden oldugu gibi rastgele adreslere mail attirilamaz.
     */
    public function sendVerificationEmail(Request $request)
    {
        $customer = auth('api_customer')->user();
        if (!$customer) {
            return unauthorized_response();
        }

        $requested = mb_strtolower(trim((string) $request->input('email')));
        $current = mb_strtolower(trim((string) $customer->email));

        if ($requested === '' || $requested === $current) {
            return $this->issueAccountVerificationCode($request);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191|unique:customers,email',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->verificationCodes->issue(
            $requested,
            EmailVerificationCode::PURPOSE_EMAIL_CHANGE,
            $customer->first_name,
            $request->ip()
        );

        return response()->json([
            'status' => $result['ok'],
            'status_code' => $result['ok'] ? 200 : 429,
            'code' => $result['code'],
            'email' => $requested,
            'retry_after' => $result['retry_after'],
            'message' => $result['message'],
        ], $result['ok'] ? 200 : ($result['code'] === 'send_failed' ? 500 : 429));
    }

    /**
     * E-posta degistir: yeni adrese gonderilen kod dogrulanir.
     *
     * Eskiden customers.email_verify_token ile gevsek karsilastirma yapiyordu
     * ($user->email_verify_token == $request->token) ve o kolon sifre
     * sifirlama ile paylasimliydi; artik kod, YENI adres + 'email_change'
     * amacina bagli olarak dogrulanir.
     */
    public function updateCustomerEmail(Request $request)
    {
        $customer = auth('api_customer')->user();
        if (!$customer) {
            return unauthorized_response();
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191|unique:customers,email',
            'code' => 'required_without:token|nullable|string|max:16',
            'token' => 'required_without:code|nullable|string|max:16',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $newEmail = mb_strtolower(trim((string) $request->email));
            $oldEmail = (string) $customer->email;

            $result = $this->verificationCodes->verify(
                $newEmail,
                EmailVerificationCode::PURPOSE_EMAIL_CHANGE,
                (string) ($request->input('code') ?? $request->input('token'))
            );

            if (!$result['ok']) {
                return response()->json([
                    'status' => false,
                    'status_code' => 422,
                    'code' => $result['code'],
                    'message' => $result['message'],
                ], 422);
            }

            // Yeni adres kod ile ispatlandi -> dogrulanmis say.
            $customer->forceFill([
                'email' => $newEmail,
                'email_verified' => 1,
                'email_verified_at' => now(),
                'email_verify_token' => null,
            ])->save();

            // Eski adres icin bekleyen hesap dogrulama kodu varsa anlamsiz kaldi.
            $this->verificationCodes->invalidate($oldEmail, EmailVerificationCode::PURPOSE_ACCOUNT);

            return response()->json([
                'status' => true,
                'status_code' => 200,
                'email' => $newEmail,
                'email_verified' => true,
                'message' => __('messages.update_successful'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'status_code' => 500,
                'message' => __('messages.something_went_wrong'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateAccountStatus(Request $request)
    {
        if (!auth('api_customer')->check()) {
            unauthorized_response();
        }
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:activate,deactivate',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $customer = auth('api_customer')->user();
        if ($request->type == 'deactivate') {
            $validator = Validator::make($request->only(['reason', 'description']), [
                'reason' => 'required|string|max:255',
                'description' => 'required|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => $validator->errors()
                ], 422);
            }
            $alreadyDeactivated = $customer->deactivated_at;
            if ($alreadyDeactivated) {
                return response()->json([
                    'message' => __('messages.account_already_deactivated')
                ], 422);
            }
            $reason = CustomerDeactivationReason::create([
                'customer_id' => $customer->id,
                'reason' => $request->reason,
                'description' => $request->description
            ]);
            if ($reason) {
                $customer->update([
                    'deactivated_at' => now(),
                ]);
            }
            return response()->json([
                'message' => __('messages.account_deactivate_successful')
            ], 200);
        }

        if ($request->type == 'activate') {
            $alreadyActivated = $customer->deactivated_at == null;
            if ($alreadyActivated) {
                return response()->json([
                    'message' => __('messages.account_already_activated')
                ], 422);
            }
            $activate = $this->customerRepo->activateAccount();
            if ($activate) {
                return response()->json([
                    'message' => __('messages.account_activate_successful')
                ], 200);
            } else {
                return response()->json([
                    'message' => __('messages.account_activate_failed')
                ], 500);
            }
        } else {
            return response()->json([
                'message' => __('messages.something_went_wrong')
            ], 500);
        }
    }

    public function deleteCustomerAccount()
    {
        if (!auth('api_customer')->check()) {
            unauthorized_response();
        }

        $customer = Customer::find(auth('api_customer')->user()->id);

        if ($customer->hasRunningOrders()) {
            return response()->json([
                'message' => __('messages.has_running_orders', ['name' => 'User'])
            ], 422);
        }

        $success = $this->customerRepo->deleteCustomerRelatedAllData($customer->id);

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

    public function getDashboard()
    {
        // Check if the customer is authenticated
        if (!auth('api_customer')->check()) {
            unauthorized_response();
        }
        $dashboardData = $this->customerRepo->getDashboard();
        // Return the response using the resource
        return response()->json([
            'status' => true,
            'status_code' => 200,
            'data' => new CustomerDashboardResource($dashboardData),
        ]);
    }

    public function toggleActivityNotification()
    {
        $customer = auth('api_customer')->user();
        $customer->activity_notification = !$customer->activity_notification;
        $customer->save();

        return response()->json([
            'message' => __('messages.account_activity_notification_update_success'),
            'status' => $customer->activity_notification
        ], 200);
    }

    public function toggleMarketingEmail()
    {
        $customer = auth('api_customer')->user();
        $customer->marketing_email = !$customer->marketing_email;
        $customer->save();

        return response()->json([
            'message' => __('messages.account_marketing_notification_update_success'),
            'status' => $customer->marketing_email
        ]);
    }
}
