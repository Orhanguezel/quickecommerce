<?php

namespace Database\Seeders;

use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Database\Seeder;
use Modules\Chat\app\Models\AiChatKnowledge;

/**
 * AiChatSeeder
 *
 * ✅ SAFE: Uses updateOrCreate() throughout - idempotent.
 * Can be run on every deployment via ProductionSeeder.
 */
class AiChatSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🤖 Seeding AI Chat settings...');

        // ── AI Chat Settings ──────────────────────────────────────
        $settings = [
            'com_ai_chat_enabled'          => 'on',
            'com_ai_chat_active_provider'  => 'groq',
            'com_ai_chat_api_key'          => env('GROQ_API_KEY', ''),
            'com_ai_chat_model'            => 'llama-3.3-70b-versatile',
            'com_ai_chat_max_tokens'       => '1024',
            'com_ai_chat_temperature'      => '0.7',
            'com_ai_chat_guest_enabled'    => 'on',
            'com_ai_chat_system_prompt'    => 'Sen Sporto Online e-ticaret sitesinin müşteri destek asistanısın. Müşterilere ürünler, siparişler, kargo, iade ve ödeme konularında yardımcı ol. Nazik, profesyonel ve kısa yanıtlar ver. Bilmediğin konularda müşteriyi canlı desteğe yönlendir. Yanıtlarını Türkçe ver (müşteri İngilizce yazarsa İngilizce yanıt ver).',
        ];

        foreach ($settings as $key => $value) {
            SettingOption::updateOrCreate(
                ['option_name' => $key],
                ['option_value' => $value],
            );
        }

        // EN translation for system prompt
        $promptOption = SettingOption::where('option_name', 'com_ai_chat_system_prompt')->first();
        if ($promptOption) {
            Translation::updateOrCreate(
                [
                    'translatable_type' => SettingOption::class,
                    'translatable_id'   => $promptOption->id,
                    'language'          => 'en',
                    'key'               => 'com_ai_chat_system_prompt',
                ],
                [
                    'value' => 'You are Sporto Online e-commerce customer support assistant. Help customers with products, orders, shipping, returns, and payment. Be polite, professional, and concise. Direct to live support for unknown topics. Reply in the same language the customer uses.',
                ]
            );
        }

        // ── Default Knowledge Base Entries ─────────────────────────
        $this->command->info('📚 Seeding AI Chat knowledge base...');

        $knowledgeEntries = [
            [
                'category'    => 'shipping',
                'question_tr' => 'Kargo ne zaman gelir?',
                'answer_tr'   => 'Siparişiniz 1-3 iş günü içinde kargoya verilir. Kargo süresi bulunduğunuz lokasyona göre 1-5 iş günü arasında değişmektedir. Sipariş takip numaranızla kargo durumunu sorgulayabilirsiniz.',
                'question_en' => 'When will my order arrive?',
                'answer_en'   => 'Your order will be shipped within 1-3 business days. Delivery time varies between 1-5 business days depending on your location. You can track your order using the tracking number.',
            ],
            [
                'category'    => 'shipping',
                'question_tr' => 'Kargo ücreti ne kadar?',
                'answer_tr'   => 'Kargo ücreti sipariş tutarına ve teslimat adresine göre değişir. Belirli bir tutarın üzerindeki siparişlerde kargo ücretsizdir. Detaylı bilgi için ödeme sayfasında kargo ücretini görebilirsiniz.',
                'question_en' => 'How much is the shipping fee?',
                'answer_en'   => 'Shipping fee varies based on order amount and delivery address. Orders above a certain amount qualify for free shipping. You can see the exact shipping cost on the checkout page.',
            ],
            [
                'category'    => 'returns',
                'question_tr' => 'İade ve değişim politikası nedir?',
                'answer_tr'   => 'Ürünlerimizi teslim aldığınız tarihten itibaren 14 gün içinde iade edebilirsiniz. Ürün kullanılmamış ve orijinal ambalajında olmalıdır. İade işleminizi hesabınızdaki siparişlerim bölümünden başlatabilirsiniz.',
                'question_en' => 'What is the return and exchange policy?',
                'answer_en'   => 'You can return products within 14 days of delivery. Products must be unused and in original packaging. You can initiate a return from the "My Orders" section in your account.',
            ],
            [
                'category'    => 'payment',
                'question_tr' => 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
                'answer_tr'   => 'Kredi kartı, banka kartı, havale/EFT ve kapıda ödeme seçeneklerimiz mevcuttur. Tüm ödeme işlemleriniz güvenli altyapımız ile korunmaktadır.',
                'question_en' => 'What payment methods do you accept?',
                'answer_en'   => 'We accept credit cards, debit cards, bank transfers, and cash on delivery. All payment transactions are secured by our trusted payment infrastructure.',
            ],
            [
                'category'    => 'orders',
                'question_tr' => 'Siparişimi nasıl takip edebilirim?',
                'answer_tr'   => 'Hesabınıza giriş yaptıktan sonra "Siparişlerim" bölümünden tüm siparişlerinizin durumunu görebilirsiniz. Siparişiniz kargoya verildiğinde takip numarası ile kargo firmasının sitesinden de takip edebilirsiniz.',
                'question_en' => 'How can I track my order?',
                'answer_en'   => 'After logging into your account, you can see the status of all your orders in the "My Orders" section. Once your order is shipped, you can also track it on the carrier website with the tracking number.',
            ],
            [
                'category'    => 'orders',
                'question_tr' => 'Siparişimi iptal edebilir miyim?',
                'answer_tr'   => 'Siparişiniz henüz kargoya verilmediyse, hesabınızdaki siparişlerim bölümünden iptal talebinde bulunabilirsiniz. Kargoya verilmiş siparişler için iade süreci uygulanır.',
                'question_en' => 'Can I cancel my order?',
                'answer_en'   => 'If your order has not been shipped yet, you can request cancellation from the "My Orders" section. For shipped orders, the return process applies.',
            ],
            [
                'category'    => 'general',
                'question_tr' => 'Hesap nasıl oluşturulur?',
                'answer_tr'   => 'Sitemizin sağ üst köşesindeki "Giriş Yap" butonuna tıklayarak kayıt formunu doldurabilirsiniz. E-posta adresiniz ve şifrenizle hesabınızı oluşturabilirsiniz.',
                'question_en' => 'How do I create an account?',
                'answer_en'   => 'Click the "Login" button in the top right corner of our website and fill out the registration form. You can create your account with your email and password.',
            ],
            [
                'category'    => 'general',
                'question_tr' => 'Şifremi unuttum, ne yapmalıyım?',
                'answer_tr'   => 'Giriş sayfasındaki "Şifremi Unuttum" bağlantısına tıklayın. Kayıtlı e-posta adresinize şifre sıfırlama bağlantısı gönderilecektir.',
                'question_en' => 'I forgot my password, what should I do?',
                'answer_en'   => 'Click the "Forgot Password" link on the login page. A password reset link will be sent to your registered email address.',
            ],
            [
                'category'    => 'products',
                'question_tr' => 'Ürünler orijinal mi?',
                'answer_tr'   => 'Evet, platformumuzda satılan tüm ürünler orijinal ve garantilidir. Onaylı satıcılarımız tarafından satışa sunulmaktadır.',
                'question_en' => 'Are the products original?',
                'answer_en'   => 'Yes, all products sold on our platform are original and warranted. They are offered by our verified sellers.',
            ],
            [
                'category'    => 'general',
                'question_tr' => 'Müşteri hizmetlerine nasıl ulaşabilirim?',
                'answer_tr'   => 'Canlı destek sekmesinden destek talebi oluşturabilir, iletişim sayfamızdan bize e-posta gönderebilir veya telefon numaramızdan bizi arayabilirsiniz.',
                'question_en' => 'How can I contact customer service?',
                'answer_en'   => 'You can create a support ticket from the live support tab, send us an email from our contact page, or call us at our phone number.',
            ],
        ];

        foreach ($knowledgeEntries as $index => $entry) {
            $knowledge = AiChatKnowledge::updateOrCreate(
                [
                    'category' => $entry['category'],
                    'question' => $entry['question_tr'],
                ],
                [
                    'answer'    => $entry['answer_tr'],
                    'is_active' => true,
                    'sort_order' => $index,
                ]
            );

            // EN translations
            Translation::updateOrCreate(
                [
                    'translatable_type' => AiChatKnowledge::class,
                    'translatable_id'   => $knowledge->id,
                    'language'          => 'en',
                    'key'               => 'question',
                ],
                ['value' => $entry['question_en']]
            );

            Translation::updateOrCreate(
                [
                    'translatable_type' => AiChatKnowledge::class,
                    'translatable_id'   => $knowledge->id,
                    'language'          => 'en',
                    'key'               => 'answer',
                ],
                ['value' => $entry['answer_en']]
            );
        }

        $this->command->info('✅ AI Chat seeder completed!');
    }
}
