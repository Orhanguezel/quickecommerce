<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\ImageModifier;
use App\Http\Resources\Admin\AdminFooterSettingsResource;
use App\Http\Resources\Admin\AdminGdprResource;
use App\Interfaces\TranslationInterface;
use App\Models\SettingOption;
use App\Services\LicenseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SystemManagementController extends Controller
{
    public function __construct(
        protected TranslationInterface $transRepo,
        protected SettingOption        $get_com_option,
        protected SettingOption        $general_settings,
        protected LicenseService       $licenseService
    )
    {
    }

    public function translationKeys(): mixed
    {
        return $this->get_com_option->translationKeys;
    }

    public function translationKeysGdpr(): mixed
    {
        return $this->general_settings->translationKeys;
    }

    public function generalSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $validator = Validator::make($request->all(), [
                'com_site_logo' => 'nullable|string',
                'com_site_white_logo' => 'nullable|string',
                'com_site_favicon' => 'nullable|string',
                'com_site_title' => 'nullable|string',
                'com_site_subtitle' => 'nullable|string',
                'com_user_email_verification' => 'nullable|string',
                'com_user_login_otp' => 'nullable|string',
                'com_maintenance_mode' => 'nullable|string',
                // new added
                'com_site_full_address' => 'nullable|string',
                'com_site_contact_number' => 'nullable|string',
                'com_site_website_url' => 'nullable|string',
                'com_site_email' => 'nullable|string',
                'com_site_footer_copyright' => 'nullable|string',
                'com_site_time_zone' => 'nullable|string',
            ], [
                'com_site_logo.string' => 'The site logo must be a valid string.',
                'com_site_white_logo.string' => 'The site logo must be a valid string.',
                'com_site_favicon.string' => 'The site favicon must be a valid string.',
                'com_site_title.string' => 'The site title must be a valid string.',
                'com_site_subtitle.string' => 'The site subtitle must be a valid string.',
                'com_user_email_verification.string' => 'The email verification value must be a valid string.',
                'com_user_login_otp.string' => 'The login OTP value must be a valid string.',
                'com_maintenance_mode.string' => 'The maintenance mode must be a valid string.',
                'com_site_full_address.string' => 'The full address must be a valid string.',
                'com_site_contact_number.string' => 'The contact number must be a valid string.',
                'com_site_website_url.string' => 'The website URL must be a valid string.',
                'com_site_email.string' => 'The site email must be a valid string.',
                'com_site_footer_copyright.string' => 'The footer copyright must be a valid string.',
                'com_site_time_zone.string' => 'The time zone must be a valid string.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fields = ['com_site_logo', 'com_site_white_logo', 'com_site_favicon', 'com_site_title', 'com_site_subtitle', 'com_user_email_verification', 'com_user_login_otp', 'com_maintenance_mode',
                'com_site_full_address', 'com_site_contact_number', 'com_site_website_url', 'com_site_email', 'com_site_footer_copyright', 'com_site_time_zone'
            ];

            foreach ($fields as $field) {
                $value = $request->input($field) ?? null;
                com_option_update($field, $value);
            }

            // Define the fields that need to be translated
            $fields = ['com_site_title', 'com_site_subtitle', 'com_site_full_address', 'com_site_contact_number', 'com_site_footer_copyright'];
            $setting_options = SettingOption::whereIn('option_name', $fields)->get(['id', 'option_name']);

            foreach ($setting_options as $com_option) {
                createOrUpdateTranslation($request, $com_option->id, 'App\Models\SettingOption', $this->translationKeys());
            }

            return $this->success(translate('messages.update_success', ['name' => 'General Settings']));
        } else {
            // Create an instance of ImageModifier
            $imageModifier = new ImageModifier();

            $ComOptionGet = SettingOption::with('translations')->whereIn('option_name', ['com_site_title', 'com_site_subtitle'])
                ->get(['id']);

            // transformed data
            $transformedData = [];
            foreach ($ComOptionGet as $com_option) {
                $translations = $com_option->translations()->get()->groupBy('language');
                foreach ($translations as $language => $items) {
                    $languageInfo = ['language' => $language];
                    /* iterate all Column to Assign Language Value */
                    foreach ($this->get_com_option->translationKeys as $columnName) {
                        $languageInfo[$columnName] = $items->where('key', $columnName)->first()->value ?? "";
                    }
                    $transformedData[] = $languageInfo;
                }
            }

            $com_site_logo = com_option_get('com_site_logo');
            $com_site_white_logo = com_option_get('com_site_white_logo');
            $com_site_favicon = com_option_get('com_site_favicon');
            $com_site_logo_image_url = $imageModifier->generateImageUrl(com_option_get('com_site_logo'));
            $com_site_white_logo_image_url = $imageModifier->generateImageUrl(com_option_get('com_site_white_logo'));
            $com_site_favicon_image_url = $imageModifier->generateImageUrl(com_option_get('com_site_favicon'));
            $com_site_title = com_option_get('com_site_title') ?? '';
            $com_site_subtitle = com_option_get('com_site_subtitle') ?? '';
            $com_user_email_verification = com_option_get('com_user_email_verification') ?? '';
            $com_user_login_otp = com_option_get('com_user_login_otp') ?? '';
            $com_maintenance_mode = com_option_get('com_maintenance_mode') ?? '';

            // New data
            $com_site_full_address = com_option_get('com_site_full_address') ?? '';
            $com_site_footer_copyright = com_option_get('com_site_footer_copyright') ?? '';
            $com_site_contact_number = com_option_get('com_site_contact_number') ?? '';
            $com_site_website_url = com_option_get('com_site_website_url') ?? '';
            $com_site_email = com_option_get('com_site_email') ?? '';
            $com_site_time_zone = com_option_get('com_site_time_zone') ?? '';

            return $this->success([
                'com_site_logo' => $com_site_logo,
                'com_site_white_logo' => $com_site_white_logo,
                'com_site_favicon' => $com_site_favicon,
                'com_site_logo_image_url' => $com_site_logo_image_url,
                'com_site_white_logo_image_url' => $com_site_white_logo_image_url,
                'com_site_favicon_image_url' => $com_site_favicon_image_url,
                'com_site_title' => $com_site_title,
                'com_site_subtitle' => $com_site_subtitle,
                'com_user_email_verification' => $com_user_email_verification,
                'com_user_login_otp' => $com_user_login_otp,
                'com_maintenance_mode' => $com_maintenance_mode,
                // New data
                'com_site_full_address' => $com_site_full_address,
                'com_site_footer_copyright' => $com_site_footer_copyright,
                'com_site_contact_number' => $com_site_contact_number,
                'com_site_website_url' => $com_site_website_url,
                'com_site_email' => $com_site_email,
                'com_site_time_zone' => $com_site_time_zone,
                'translations' => $transformedData,
            ]);


        }

    }

    public function seoSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $this->validate($request, [
                'com_meta_title' => 'nullable|string',
                'com_meta_description' => 'nullable|string',
                'com_meta_tags' => 'nullable|string',
                'com_canonical_url' => 'nullable|string',
                'com_og_title' => 'nullable|string',
                'com_og_description' => 'nullable|string',
                'com_og_image' => 'nullable|string',
            ]);

            $fields = ['com_meta_title', 'com_meta_description', 'com_meta_tags', 'com_canonical_url', 'com_og_title', 'com_og_description', 'com_og_image'];

            foreach ($fields as $field) {
                $value = $request->input($field) ?? null;
                com_option_update($field, $value);
            }

            // Define the fields that need to be translated
            $fields = ['com_meta_title', 'com_meta_description', 'com_meta_tags', 'com_og_title', 'com_og_description'];
            $setting_options = SettingOption::whereIn('option_name', $fields)->get(['id']);

            foreach ($setting_options as $com_option) {
                createOrUpdateTranslation($request, $com_option->id, 'App\Models\SettingOption', $this->translationKeys());
            }

            return $this->success(translate('messages.update_success', ['name' => 'SEO Settings']));
        } else {
            // Create an instance of ImageModifier
            $imageModifier = new ImageModifier();

            $ComOptionGet = SettingOption::with('translations')
                ->whereIn('option_name', ['com_meta_title', 'com_meta_description', 'com_meta_tags', 'com_og_title', 'com_og_description'])
                ->get(['id']);

            // transformed data
            $transformedData = [];
            foreach ($ComOptionGet as $com_option) {
                $translations = $com_option->translations()->get()->groupBy('language');
                foreach ($translations as $language => $items) {
                    $languageInfo = ['language' => $language];
                    /* iterate all Column to Assign Language Value */
                    foreach ($this->get_com_option->translationKeys as $columnName) {
                        $languageInfo[$columnName] = $items->where('key', $columnName)->first()->value ?? "";
                    }
                    $transformedData[] = $languageInfo;
                }
            }

            $com_meta_title = com_option_get('com_meta_title');
            $com_meta_description = com_option_get('com_meta_description');
            $com_meta_tags = com_option_get('com_meta_tags');
            $com_canonical_url = com_option_get('com_canonical_url');
            $com_og_title = com_option_get('com_og_title');
            $com_og_description = com_option_get('com_og_description');
            $com_og_image = com_option_get('com_og_image');
            $com_og_image_url = $imageModifier->generateImageUrl(com_option_get('com_og_image'));

            return $this->success([
                'com_meta_title' => $com_meta_title,
                'com_meta_description' => $com_meta_description,
                'com_meta_tags' => $com_meta_tags,
                'com_canonical_url' => $com_canonical_url,
                'com_og_title' => $com_og_title,
                'com_og_description' => $com_og_description,
                'com_og_image' => $com_og_image,
                'com_og_image_url' => $com_og_image_url,
                'translations' => $transformedData,
            ]);
        }

    }

    public function footerCustomization(Request $request)
    {

        if ($request->isMethod('POST')) {
            $this->validate($request, [
                'content' => 'array',
            ]);
            $contentData = $request->input('content', []);
            $translationKeys = ['content'];
            $footer_settings = SettingOption::updateOrCreate(
                ['option_name' => 'footer_settings'], // A new, single key for the full content
                ['option_value' => json_encode($contentData)] // Store the entire content as JSON
            );

            createOrUpdateTranslationJson($request, $footer_settings->id, 'App\Models\SettingOption', $translationKeys);
            return $this->success(translate('messages.update_success', ['name' => 'Footer Settings']));
        } else {
            $footer_settings = SettingOption::with('translations')
                ->where('option_name', 'footer_settings')
                ->first();

            if (!$footer_settings) {
                return response()->json([
                    'message' => __('messages.data_not_found')
                ], 404);
            }

            $json_decoded = json_decode($footer_settings->option_value, true);
            $content = jsonImageModifierFormatter($json_decoded);
            $footer_settings->option_value = $content;

            return response()->json([
                'data' => new AdminFooterSettingsResource($footer_settings)
            ]);
        }
    }


    public function maintenanceSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $this->validate($request, [
                'com_maintenance_title' => 'nullable|string',
                'com_maintenance_description' => 'nullable|string',
                'com_maintenance_start_date' => 'nullable|string',
                'com_maintenance_end_date' => 'nullable|string',
                'com_maintenance_image' => 'nullable|string',
                'com_maintenance_mode' => 'nullable|string',
            ]);

            $fields = ['com_maintenance_title', 'com_maintenance_description', 'com_maintenance_start_date', 'com_maintenance_end_date', 'com_maintenance_image', 'com_maintenance_mode'];
            foreach ($fields as $field) {
                $value = $request->input($field) ?? null;
                com_option_update($field, $value);
            }

            // Normalize translations payload (accept array, object map, or JSON string)
            $translations = $request->input('translations');
            if (is_string($translations)) {
                $decoded = json_decode($translations, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $translations = $decoded;
                }
            }
            if (is_object($translations)) {
                $translations = json_decode(json_encode($translations), true);
            }
            if (is_array($translations)) {
                $keys = array_keys($translations);
                $isAssoc = $keys !== range(0, count($translations) - 1);
                if ($isAssoc) {
                    $normalized = [];
                    foreach ($translations as $lang => $vals) {
                        if (!is_array($vals)) continue;
                        $normalized[] = array_merge(['language_code' => $lang], $vals);
                    }
                    $translations = $normalized;
                }
                $request->merge(['translations' => $translations]);
            }

            // Define the fields that need to be translated
            $fields = ['com_maintenance_title', 'com_maintenance_description'];
            $setting_options = SettingOption::whereIn('option_name', $fields)->get(['id', 'option_name']);

            foreach ($setting_options as $com_option) {
                createOrUpdateTranslation($request, $com_option->id, 'App\Models\SettingOption', [$com_option->option_name]);
            }

            return $this->success(translate('messages.update_success', ['name' => 'Maintenance Settings']));
        } else {
            // Create an instance of ImageModifier
            $imageModifier = new ImageModifier();

            $ComOptionGet = SettingOption::with('translations')
                ->whereIn('option_name', ['com_maintenance_title', 'com_maintenance_description'])
                ->get(['id']);

            // transformed data
            $transformedData = [];
            foreach ($ComOptionGet as $com_option) {
                $translations = $com_option->translations()->get()->groupBy('language');
                foreach ($translations as $language => $items) {
                    $languageInfo = ['language' => $language];
                    /* iterate all Column to Assign Language Value */
                    foreach ($this->get_com_option->translationKeys as $columnName) {
                        $languageInfo[$columnName] = $items->where('key', $columnName)->first()->value ?? "";
                    }
                    $transformedData[] = $languageInfo;
                }
            }

            $com_maintenance_title = com_option_get('com_maintenance_title');
            $com_maintenance_description = com_option_get('com_maintenance_description');
            $com_maintenance_start_date = com_option_get('com_maintenance_start_date');
            $com_maintenance_end_date = com_option_get('com_maintenance_end_date');
            $com_maintenance_image = com_option_get('com_maintenance_image');
            $com_maintenance_image_url = $imageModifier->generateImageUrl(com_option_get('com_maintenance_image'));
            $com_maintenance_mode = com_option_get('com_maintenance_mode');

            return $this->success([
                'com_maintenance_title' => $com_maintenance_title,
                'com_maintenance_description' => $com_maintenance_description,
                'com_maintenance_start_date' => $com_maintenance_start_date,
                'com_maintenance_end_date' => $com_maintenance_end_date,
                'com_maintenance_image' => $com_maintenance_image,
                'com_maintenance_image_url' => $com_maintenance_image_url,
                'com_maintenance_mode' => $com_maintenance_mode,
                'translations' => $transformedData,
            ]);
        }

    }

    public function socialLoginSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $this->validate($request, [
                // google
                'com_google_login_enabled' => 'nullable|string',
                'com_google_app_id' => 'nullable|string',
                'com_google_client_secret' => 'nullable|string',
                'com_google_client_callback_url' => 'nullable|string',
                // facebook
                'com_facebook_login_enabled' => 'nullable|string',
                'com_facebook_app_id' => 'nullable|string',
                'com_facebook_client_secret' => 'nullable|string',
                'com_facebook_client_callback_url' => 'nullable|string',
            ]);

            $fields = [
                'com_google_login_enabled',
                'com_google_app_id',
                'com_google_client_secret',
                'com_google_client_callback_url',
                'com_facebook_login_enabled',
                'com_facebook_app_id',
                'com_facebook_client_secret',
                'com_facebook_client_callback_url',
            ];

            foreach ($fields as $field) {
                $value = $request->input($field) ?? null;
                com_option_update($field, $value);
            }
            return $this->success(translate('messages.update_success', ['name' => 'Social Login Settings']));
        } else {
            // Retrieve the values using the correct keys
            $com_google_login_enabled = com_option_get('com_google_login_enabled');
            $com_google_app_id = com_option_get('com_google_app_id');
            $com_google_client_secret = com_option_get('com_google_client_secret');
            $com_google_client_callback_url = com_option_get('com_google_client_callback_url');

            $com_facebook_login_enabled = com_option_get('com_facebook_login_enabled');
            $com_facebook_app_id = com_option_get('com_facebook_app_id');
            $com_facebook_client_secret = com_option_get('com_facebook_client_secret');
            $com_facebook_client_callback_url = com_option_get('com_facebook_client_callback_url');


            // Mask values if in demo mode
            if (Config::get('demoMode.check')) {
                $com_google_login_enabled = '';
                $com_google_app_id = '';
                $com_google_client_secret = '';
                $com_google_client_callback_url = '';

                $com_facebook_login_enabled = '';
                $com_facebook_app_id = '';
                $com_facebook_client_secret = '';
                $com_facebook_client_callback_url = '';
            }

            return $this->success([
                'com_google_login_enabled' => $com_google_login_enabled,
                'com_google_app_id' => $com_google_app_id,
                'com_google_client_secret' => $com_google_client_secret,
                'com_google_client_callback_url' => $com_google_client_callback_url,
                'com_facebook_login_enabled' => $com_facebook_login_enabled,
                'com_facebook_app_id' => $com_facebook_app_id,
                'com_facebook_client_secret' => $com_facebook_client_secret,
                'com_facebook_client_callback_url' => $com_facebook_client_callback_url,
            ]);
        }

    }

    public function firebaseSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $validator = Validator::make($request->all(), [
                'firebase_json_file' => 'required|file|mimes:json|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }
            // Ensure the folder exists before storing the file
            $folderPath = storage_path('app/firebase');
            if (!file_exists($folderPath)) {
                mkdir($folderPath, 0755, true); // Create folder with proper permissions
            }

            $request->file('firebase_json_file')->storeAs('firebase', 'firebase.json', 'local');

            return $this->success(translate('messages.update_success', ['name' => 'Firebase Settings']));
        } else {
            $firebaseFileExists = Storage::disk('local')->exists('firebase/firebase.json');
            return $this->success([
                'firebase_file' => $firebaseFileExists,
            ]);
        }
    }

    public function openAiSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $validator = Validator::make($request->all(), [
                'com_openai_api_key' => 'nullable|string',
                'com_openai_model' => 'nullable|string',
                'com_openai_timeout' => 'nullable|string',
                'com_openai_enable_disable' => 'nullable|string',
                'com_claude_api_key' => 'nullable|string',
                'com_claude_model' => 'nullable|string',
                'com_claude_timeout' => 'nullable|string',
                'com_claude_enable_disable' => 'nullable|string',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors(),
                ], 422);
            }
            com_option_update('com_openai_api_key', $request->com_openai_api_key);
            com_option_update('com_openai_model', $request->com_openai_model);
            com_option_update('com_openai_timeout', $request->com_openai_timeout);
            com_option_update('com_openai_enable_disable', $request->com_openai_enable_disable);

            com_option_update('com_claude_api_key', $request->com_claude_api_key);
            com_option_update('com_claude_model', $request->com_claude_model);
            com_option_update('com_claude_timeout', $request->com_claude_timeout);
            com_option_update('com_claude_enable_disable', $request->com_claude_enable_disable);

            return $this->success(translate('messages.update_success', ['name' => 'AI Settings']));
        }


        $com_openai_api_key = com_option_get('com_openai_api_key');
        $com_openai_model = com_option_get('com_openai_model');
        $com_openai_timeout = com_option_get('com_openai_timeout');
        $com_openai_enable_disable = com_option_get('com_openai_enable_disable');

        $com_claude_api_key = com_option_get('com_claude_api_key');
        $com_claude_model = com_option_get('com_claude_model');
        $com_claude_timeout = com_option_get('com_claude_timeout');
        $com_claude_enable_disable = com_option_get('com_claude_enable_disable');

        //demo check
        if (Config::get('demoMode.check')) {
            $com_openai_api_key = '';
            $com_openai_model = '';
            $com_claude_api_key = '';
            $com_claude_model = '';
        }

        return response()->json([
            'success' => true,
            'data' => [
                'com_openai_api_key'        => $com_openai_api_key,
                'com_openai_model'          => $com_openai_model,
                'com_openai_timeout'        => $com_openai_timeout,
                'com_openai_enable_disable' => $com_openai_enable_disable,
                'com_claude_api_key'        => $com_claude_api_key,
                'com_claude_model'          => $com_claude_model,
                'com_claude_timeout'        => $com_claude_timeout,
                'com_claude_enable_disable' => $com_claude_enable_disable,
            ]
        ], 200);

    }

  public function googleMapSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $validator = Validator::make($request->all(), [
                'com_google_map_api_key' => 'nullable|string',
                'com_google_map_enable_disable' => 'nullable|string',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors(),
                ], 422);
            }
            com_option_update('com_google_map_enable_disable', $request->com_google_map_enable_disable);
            com_option_update('com_google_map_api_key', $request->com_google_map_api_key);

            return $this->success(translate('messages.update_success', ['name' => 'Google Map Settings']));
        }


        $com_google_map_enable_disable = com_option_get('com_google_map_enable_disable');
        $com_google_map_api_key = com_option_get('com_google_map_api_key');

        //demo check
        if (Config::get('demoMode.check')) {
            $com_google_map_enable_disable = '';
            $com_google_map_api_key = '';
        }

        return $this->success([
            'com_google_map_enable_disable' => $com_google_map_enable_disable,
            'com_google_map_api_key' => $com_google_map_enable_disable === 'on' ? $com_google_map_api_key : '',
        ]);
    }


    public function cargoSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $validator = Validator::make($request->all(), [
                'geliver_api_token'          => 'nullable|string',
                'geliver_test_mode'          => 'nullable|string',
                'geliver_sender_address_id'  => 'nullable|string',
            ]);
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
            com_option_update('geliver_api_token', $request->geliver_api_token);
            com_option_update('geliver_test_mode', $request->geliver_test_mode);
            com_option_update('geliver_sender_address_id', $request->geliver_sender_address_id);

            // .env dosyasını da güncelle
            $this->updateEnvValue('GELIVER_API_TOKEN', $request->geliver_api_token ?? '');
            $this->updateEnvValue('GELIVER_TEST_MODE', $request->geliver_test_mode === 'on' ? 'false' : 'true');
            $this->updateEnvValue('GELIVER_SENDER_ADDRESS_ID', $request->geliver_sender_address_id ?? '');

            return $this->success(translate('messages.update_success', ['name' => 'Cargo Settings']));
        }

        return $this->success([
            'geliver_api_token'         => com_option_get('geliver_api_token'),
            'geliver_test_mode'         => com_option_get('geliver_test_mode'),
            'geliver_sender_address_id' => com_option_get('geliver_sender_address_id'),
        ]);
    }

    private function updateEnvValue(string $key, string $value): void
    {
        $envPath = base_path('.env');
        if (!file_exists($envPath)) return;
        $env = file_get_contents($envPath);
        $pattern = '/^' . preg_quote($key, '/') . '=.*/m';
        $replacement = $key . '=' . $value;
        if (preg_match($pattern, $env)) {
            $env = preg_replace($pattern, $replacement, $env);
        } else {
            $env .= PHP_EOL . $replacement;
        }
        file_put_contents($envPath, $env);
    }

    public function recaptchaSettings(Request $request)
    {

        if ($request->isMethod('POST')) {
            $validator = Validator::make($request->all(), [
                'com_google_recaptcha_v3_site_key' => 'nullable|string',
                'com_google_recaptcha_v3_secret_key' => 'nullable|string',
                'com_google_recaptcha_enable_disable' => 'nullable|string',
            ]);
            if ($validator->fails()) {
                return response()->json([
                    'errors' => $validator->errors(),
                ], 422);
            }
            com_option_update('com_google_recaptcha_v3_site_key', $request->com_google_recaptcha_v3_site_key);
            com_option_update('com_google_recaptcha_v3_secret_key', $request->com_google_recaptcha_v3_secret_key);
            com_option_update('com_google_recaptcha_enable_disable', $request->com_google_recaptcha_enable_disable);
            return $this->success(translate('messages.update_success', ['name' => 'Recaptcha Settings']));
        }

        $com_google_recaptcha_v3_site_key = com_option_get('com_google_recaptcha_v3_site_key');
        $com_google_recaptcha_v3_secret_key = com_option_get('com_google_recaptcha_v3_secret_key');
        $com_google_recaptcha_enable_disable = com_option_get('com_google_recaptcha_enable_disable');

        //demo check
        if (Config::get('demoMode.check')) {
            $com_google_recaptcha_v3_site_key = '';
            $com_google_recaptcha_v3_secret_key = '';
            $com_google_recaptcha_enable_disable = '';
        }

        return $this->success([
            'site_key' => $com_google_recaptcha_v3_site_key,
            'secret_key' => $com_google_recaptcha_v3_secret_key,
            'recaptcha_enable_disable' => $com_google_recaptcha_enable_disable,
        ]);
    }

    public function gdprCookieSettings(Request $request)
    {
        if ($request->isMethod('GET')) {
            $settings = SettingOption::with('related_translations')
                ->where('option_name', 'gdpr_data')
                ->first();

            if (!$settings) {
                return response()->json([
                    'message' => __('messages.data_not_found')
                ], 404);
            }
            $json_decoded = json_decode($settings->option_value, true);
            $content = jsonImageModifierFormatter($json_decoded);
            $settings->option_value = $content;

            return response()->json([
                'data' => new AdminGdprResource($settings),
            ]);
        }

        $validatedData = $request->validate([
            'content' => 'required|array'
        ]);


        $settings = SettingOption::where('option_name', 'gdpr_data')->first();
        $translationKeys = ['content'];

        if (!empty($settings)) {
            $settings->update([
                'option_value' => json_encode($validatedData['content']),
            ]);
        } else {
            $settings = SettingOption::updateOrCreate([
                'option_name' => 'gdpr_data',
                'option_value' => json_encode($validatedData['content']),
                'autoload' => 'json',
            ]);
        }

        createOrUpdateTranslationJson($request, $settings->id, 'App\Models\SettingOption', $translationKeys);

        return response()->json([
            'success' => true,
            'message' => 'Settings saved successfully',
        ]);
    }

    public function cacheManagement(Request $request)
    {
        $validatedData = $request->validate([
            'cache_clear_type' => 'required|string|in:cache,config,route,view', // Ensure valid cache types
        ]);

        try {
            // Clear the application cache based on the provided type
            Artisan::call($validatedData['cache_clear_type'] . ':clear');

            return response()->json([
                'status' => 'success',
                'message' => ucfirst($validatedData['cache_clear_type']) . ' cache cleared successfully!',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear cache.',
                'error' => $e->getMessage(),
            ], 402);
        }

    }

    public function databaseUpdateControl(Request $request)
    {
        try {
            // Store original environment
            $originalEnv = env('APP_ENV');
            updateEnvValues(['APP_ENV' => $originalEnv]);
            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('cache:clear');
            updateEnvValues(['APP_ENV' => $originalEnv]);
            return response()->json([
                'status' => true,
                'message' => 'Database and cache operations completed successfully!',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Database update failed!',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function licenseSystem(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'site_license_key' => 'required|string|max:255',
            'envato_username' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // api check
        $result = $this->licenseService->activate(
            $request->site_license_key,
            $request->envato_username
        );

        $type = "danger";
        $message = "License verification failed. Please try again later or contact support.";

        // If activation is successful
        if (!empty($result['status']) && $result['status']) {
            // Save license data
            com_option_update('application_license_key', $request->site_license_key);
            com_option_update('application_license_status', $result['status']);
            com_option_update('application_license_message', $result['message']);

            $type = 'success';
            $message = $result['message'];
        }

        return response()->json([
            'type' => $type,
            'message' => $message,
        ]);
    }


}
