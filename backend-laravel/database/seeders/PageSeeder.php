<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('pages')) {
            $this->command->warn('PageSeeder: pages table does not exist. Skipping...');
            return;
        }

        $type = 'App\\Models\\Page';

        // Dynamic pages to seed (excludes special pages: about, contact, become-a-seller)
        $pages = [
            [
                'slug' => 'terms-conditions',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'title_tr' => 'Kullanım Koşulları',
                'title_en' => 'Terms and Conditions',
                'content_tr' => '<h2>Kullanım Koşulları</h2><p>Sportoonline\'a hoş geldiniz. Bu Kullanım Koşulları, sportoonline.com üzerinden sunulan hizmetlerin kullanımına ilişkin kuralları ve düzenlemeleri belirler.</p><p>Sportoonline\'a erişerek veya kullanarak bu koşulları kabul etmiş olursunuz. Koşullarımızı kabul etmiyorsanız, lütfen sitemizi kullanmayınız.</p><h3>1. Hesap Oluşturma</h3><p>Sportoonline\'dan alışveriş yapabilmek için bir hesap oluşturmanız gerekebilir. Hesap bilgilerinizin doğruluğunu ve güvenliğini sağlamak sizin sorumluluğunuzdadır.</p><h3>2. Sipariş ve Ödeme</h3><p>Sportoonline üzerinden verilen tüm siparişler, ödeme onayından sonra işleme alınır. Ödeme işlemleri güvenli ödeme altyapısı ile gerçekleştirilir.</p><h3>3. Ürün Bilgileri</h3><p>Sportoonline\'daki mağazalar, spor ürünleriyle ilgili doğru ve eksiksiz bilgi sağlamakla yükümlüdür. Sportoonline, mağazaların sağladığı bilgilerin doğruluğundan sorumlu değildir.</p><h3>4. Fikri Mülkiyet</h3><p>Sportoonline\'daki tüm içerikler, logolar ve tasarımlar fikri mülkiyet haklarıyla korunmaktadır. İzinsiz kullanım yasaktır.</p><h3>5. Sorumluluk Sınırlaması</h3><p>Sportoonline, yasaların izin verdiği ölçüde, dolaylı veya sonuç olarak ortaya çıkan zararlardan sorumlu tutulamaz.</p>',
                'content_en' => '<h2>Terms and Conditions</h2><p>Welcome to Sportoonline. These Terms and Conditions outline the rules and regulations for the use of services offered through sportoonline.com.</p><p>By accessing or using Sportoonline, you agree to these terms. If you do not agree with our terms, please do not use our site.</p><h3>1. Account Creation</h3><p>You may need to create an account to shop on Sportoonline. You are responsible for ensuring the accuracy and security of your account information.</p><h3>2. Orders and Payment</h3><p>All orders placed through Sportoonline are processed after payment confirmation. Payment transactions are carried out through a secure payment infrastructure.</p><h3>3. Product Information</h3><p>Stores on Sportoonline are responsible for providing accurate and complete information about their sports products. Sportoonline is not responsible for the accuracy of information provided by stores.</p><h3>4. Intellectual Property</h3><p>All content, logos, and designs on Sportoonline are protected by intellectual property rights. Unauthorized use is prohibited.</p><h3>5. Limitation of Liability</h3><p>Sportoonline cannot be held responsible for indirect or consequential damages to the extent permitted by law.</p>',
                'meta_title_tr' => 'Kullanım Koşulları | Sportoonline',
                'meta_title_en' => 'Terms and Conditions | Sportoonline',
                'meta_description_tr' => 'Sportoonline kullanım koşullarını ve kurallarını öğrenin.',
                'meta_description_en' => 'Learn about Sportoonline usage terms and conditions.',
                'meta_keywords_tr' => 'sportoonline kullanım koşulları, şartlar, kurallar',
                'meta_keywords_en' => 'sportoonline terms and conditions, rules, regulations',
            ],
            [
                'slug' => 'privacy-policy',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'title_tr' => 'Gizlilik Politikası',
                'title_en' => 'Privacy Policy',
                'content_tr' => '<h2>Gizlilik Politikası</h2><p>Sportoonline olarak gizliliğiniz bizim için önemlidir. Bu Gizlilik Politikası, kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.</p><h3>1. Toplanan Bilgiler</h3><p>Ad, e-posta adresi, telefon numarası, teslimat adresi ve ödeme bilgileri gibi kişisel bilgilerinizi topluyoruz.</p><h3>2. Bilgilerin Kullanımı</h3><p>Toplanan bilgiler; siparişlerinizi işlemek, Sportoonline hesabınızı yönetmek, size daha iyi spor ürünleri deneyimi sunmak ve yasal yükümlülüklerimizi yerine getirmek için kullanılır.</p><h3>3. Bilgi Güvenliği</h3><p>Sportoonline, kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktadır. Verileriniz SSL şifreleme ile korunmaktadır.</p><h3>4. Çerezler</h3><p>Sportoonline, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz.</p><h3>5. Üçüncü Taraf Paylaşımı</h3><p>Kişisel bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.</p>',
                'content_en' => '<h2>Privacy Policy</h2><p>At Sportoonline, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p><h3>1. Information Collected</h3><p>We collect personal information such as name, email address, phone number, delivery address, and payment details.</p><h3>2. Use of Information</h3><p>Collected information is used to process your orders, manage your Sportoonline account, provide a better sports products experience, and fulfill our legal obligations.</p><h3>3. Information Security</h3><p>Sportoonline implements industry-standard security measures to protect your personal information. Your data is protected with SSL encryption.</p><h3>4. Cookies</h3><p>Sportoonline uses cookies to improve user experience. You can manage your cookie preferences from your browser settings.</p><h3>5. Third-Party Sharing</h3><p>Your personal information will not be shared with third parties except as required by law.</p>',
                'meta_title_tr' => 'Gizlilik Politikası | Sportoonline',
                'meta_title_en' => 'Privacy Policy | Sportoonline',
                'meta_description_tr' => 'Sportoonline\'da kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu öğrenin.',
                'meta_description_en' => 'Learn how your personal information is collected, used, and protected on Sportoonline.',
                'meta_keywords_tr' => 'sportoonline gizlilik politikası, kişisel veriler, veri koruma',
                'meta_keywords_en' => 'sportoonline privacy policy, personal data, data protection',
            ],
            [
                'slug' => 'refund-policies',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'title_tr' => 'İade Politikası',
                'title_en' => 'Refund Policy',
                'content_tr' => '<h2>İade ve İptal Politikası</h2><p>Sportoonline olarak müşterilerimize sorunsuz bir alışveriş deneyimi sunmayı hedefliyoruz. İade ve iptal koşullarımızı lütfen dikkatlice okuyunuz.</p><h3>1. İade Koşulları</h3><p>Sportoonline\'dan satın aldığınız spor ürünlerini teslim tarihinden itibaren 14 gün içinde iade edebilirsiniz. İade edilecek ürünler kullanılmamış, orijinal ambalajında ve etiketleri sağlam olmalıdır.</p><h3>2. İade Süreci</h3><p>İade talebinizi Sportoonline hesabınız üzerinden oluşturabilirsiniz. Talebiniz onaylandıktan sonra iade kargo kodunuz tarafınıza iletilecektir.</p><h3>3. Geri Ödeme</h3><p>İade edilen ürün kontrolü tamamlandıktan sonra, geri ödeme 5-10 iş günü içinde orijinal ödeme yönteminize yapılacaktır.</p><h3>4. İade Edilemeyen Ürünler</h3><p>Kişiye özel üretilmiş spor ürünleri, ambalajı açılmış hijyen ürünleri ve kullanılmış spor ekipmanları iade edilemez.</p>',
                'content_en' => '<h2>Refund and Return Policy</h2><p>At Sportoonline, we aim to provide a seamless shopping experience for our customers. Please read our refund and return conditions carefully.</p><h3>1. Return Conditions</h3><p>You can return sports products purchased from Sportoonline within 14 days from the delivery date. Returned products must be unused, in original packaging, and with tags intact.</p><h3>2. Return Process</h3><p>You can create a return request through your Sportoonline account. After your request is approved, a return shipping code will be provided to you.</p><h3>3. Refund</h3><p>After the returned product inspection is completed, the refund will be made to your original payment method within 5-10 business days.</p><h3>4. Non-Returnable Products</h3><p>Custom-made sports products, opened hygiene products, and used sports equipment cannot be returned.</p>',
                'meta_title_tr' => 'İade Politikası | Sportoonline',
                'meta_title_en' => 'Refund Policy | Sportoonline',
                'meta_description_tr' => 'Sportoonline iade ve iptal koşulları hakkında bilgi edinin.',
                'meta_description_en' => 'Learn about Sportoonline refund and return conditions.',
                'meta_keywords_tr' => 'sportoonline iade politikası, iade koşulları, geri ödeme',
                'meta_keywords_en' => 'sportoonline refund policy, return conditions, money back',
            ],
            [
                'slug' => 'shipping-policy',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'title_tr' => 'Kargo ve Teslimat Politikası',
                'title_en' => 'Shipping & Delivery Policy',
                'content_tr' => '<h2>Kargo ve Teslimat Politikası</h2><p>Sportoonline olarak spor ürünlerinizi doğru, sağlam ve her zaman zamanında teslim etmeye kararlıyız.</p><h3>1. Kargo Süreleri</h3><p>Sportoonline siparişleriniz, ödeme onayından sonra 1-3 iş günü içinde kargoya verilir. Teslimat süresi bulunduğunuz bölgeye göre 2-7 iş günü arasında değişmektedir.</p><h3>2. Kargo Ücreti</h3><p>Kargo ücreti, sipariş tutarına ve teslimat adresine göre belirlenir. Belirli tutar üzerindeki siparişlerde ücretsiz kargo kampanyası geçerlidir.</p><h3>3. Kargo Takibi</h3><p>Sportoonline siparişiniz kargoya verildikten sonra, kargo takip numarası e-posta ve SMS ile tarafınıza iletilir. Sportoonline hesabınız üzerinden de kargo durumunuzu takip edebilirsiniz.</p><h3>4. Teslimat Adresi</h3><p>Teslimat adresinizin doğruluğundan siz sorumlusunuz. Yanlış adres bilgisi nedeniyle yaşanan gecikmelerden Sportoonline sorumlu tutulamaz.</p>',
                'content_en' => '<h2>Shipping & Delivery Policy</h2><p>At Sportoonline, we are committed to delivering your sports products accurately, safely, and always on time.</p><h3>1. Shipping Timeframes</h3><p>Your Sportoonline orders are shipped within 1-3 business days after payment confirmation. Delivery time varies between 2-7 business days depending on your location.</p><h3>2. Shipping Fee</h3><p>Shipping fee is determined based on the order amount and delivery address. Free shipping is available for orders above a certain amount.</p><h3>3. Shipment Tracking</h3><p>After your Sportoonline order is shipped, the tracking number will be sent to you via email and SMS. You can also track your shipment status through your Sportoonline account.</p><h3>4. Delivery Address</h3><p>You are responsible for the accuracy of your delivery address. Sportoonline cannot be held responsible for delays caused by incorrect address information.</p>',
                'meta_title_tr' => 'Kargo ve Teslimat Politikası | Sportoonline',
                'meta_title_en' => 'Shipping & Delivery Policy | Sportoonline',
                'meta_description_tr' => 'Sportoonline kargo süreleri, ücretleri ve teslimat koşulları hakkında bilgi edinin.',
                'meta_description_en' => 'Learn about Sportoonline shipping timeframes, fees, and delivery conditions.',
                'meta_keywords_tr' => 'sportoonline kargo, teslimat, kargo takibi, kargo politikası',
                'meta_keywords_en' => 'sportoonline shipping, delivery, shipment tracking, shipping policy',
            ],
            [
                'slug' => 'customer-service',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'title_tr' => 'Müşteri Hizmetleri',
                'title_en' => 'Customer Service',
                'content_tr' => '<h2>Müşteri Hizmetleri</h2><p>Sportoonline siparişleriniz, ödemeleriniz, iadeleriniz ve hesap sorunlarınız konusunda yardım alın.</p><p>Sportoonline Müşteri Hizmetleri Merkezine hoş geldiniz. Amacımız, spor alışverişi deneyiminizin sorunsuz ve keyifli olmasını sağlamaktır.</p><h3>Sıkça Sorulan Sorular</h3><p>Birçok yaygın sorunun cevabını SSS bölümümüzde bulabilirsiniz. Siparişleriniz, ödeme yöntemleri, iade süreçleri ve hesap yönetimi hakkında detaylı bilgilere ulaşabilirsiniz.</p><h3>Bize Ulaşın</h3><p>Sportoonline müşteri hizmetleri ekibimize e-posta veya iletişim formumuz aracılığıyla ulaşabilirsiniz. Talebinize en kısa sürede yanıt vermeye çalışıyoruz.</p>',
                'content_en' => '<h2>Customer Service</h2><p>Get help with your Sportoonline orders, payments, returns, and account issues.</p><p>Welcome to the Sportoonline Customer Service Center. Our goal is to ensure your sports shopping experience is smooth and enjoyable.</p><h3>Frequently Asked Questions</h3><p>You can find answers to many common issues in our FAQ section. Access detailed information about your orders, payment methods, return processes, and account management.</p><h3>Contact Us</h3><p>You can reach our Sportoonline customer service team via email or our contact form. We strive to respond to your request as soon as possible.</p>',
                'meta_title_tr' => 'Müşteri Hizmetleri | Sportoonline',
                'meta_title_en' => 'Customer Service | Sportoonline',
                'meta_description_tr' => 'Sportoonline siparişler, ödemeler, iadeler ve hesap sorunları konusunda yardım alın.',
                'meta_description_en' => 'Get help with Sportoonline orders, payments, returns, and account issues.',
                'meta_keywords_tr' => 'sportoonline müşteri hizmetleri, destek, yardım',
                'meta_keywords_en' => 'sportoonline customer service, support, help',
            ],
            [
                'slug' => 'product-support',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'title_tr' => 'Ürün Desteği',
                'title_en' => 'Product Support',
                'content_tr' => '<h2>Ürün Desteği</h2><p>Sportoonline\'dan aldığınız spor ürünleriyle ilgili sorunlar, arızalar veya mağaza iletişimi konusunda yardım alın.</p><p>Spor ürünlerinde sorunlar yaşanabilir — ve böyle olduğunda, bunları hızlıca çözmenize yardımcı olmak için buradayız.</p><h3>Ürün Arızası</h3><p>Sportoonline\'dan arızalı veya hasarlı bir spor ürünü aldıysanız, teslimat tarihinden itibaren 3 gün içinde bize bildirin. Fotoğraflı kanıt ile talebinizi Sportoonline hesabınız üzerinden oluşturabilirsiniz.</p><h3>Mağaza İletişimi</h3><p>Spor ürünleriyle ilgili sorularınızı doğrudan Sportoonline mağazasına mesaj göndererek sorabilirsiniz. Mağazalar genellikle 24 saat içinde yanıt vermektedir.</p>',
                'content_en' => '<h2>Product Support</h2><p>Get help with issues, defects, or store communication regarding sports products purchased from Sportoonline.</p><p>Issues with sports products can happen — and when they do, we are here to help you resolve them quickly.</p><h3>Product Defects</h3><p>If you received a defective or damaged sports product from Sportoonline, please notify us within 3 days of delivery. You can create your request with photo evidence through your Sportoonline account.</p><h3>Store Communication</h3><p>You can ask your sports product-related questions by sending a message directly to the Sportoonline store. Stores typically respond within 24 hours.</p>',
                'meta_title_tr' => 'Ürün Desteği | Sportoonline',
                'meta_title_en' => 'Product Support | Sportoonline',
                'meta_description_tr' => 'Sportoonline spor ürünleri sorunları, arızalar ve mağaza iletişimi konusunda destek alın.',
                'meta_description_en' => 'Get support for Sportoonline sports product issues, defects, and store communication.',
                'meta_keywords_tr' => 'sportoonline ürün desteği, arıza, mağaza iletişimi, spor ürünleri',
                'meta_keywords_en' => 'sportoonline product support, defect, store communication, sports products',
            ],
            [
                'slug' => 'track-order',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'title_tr' => 'Sipariş Takibi',
                'title_en' => 'Track Order',
                'content_tr' => '<h2>Sipariş Takibi</h2><p>Sportoonline siparişlerinizin durumunu kolayca kontrol edin ve teslimat güncellemelerini anlık olarak takip edin.</p><p>Sportoonline\'dan siparişinizi verdikten sonra, nerede olduğunu ve ne zaman teslim edileceğini bilmek istersiniz. Gerçek zamanlı takip sistemimiz her adımda sizi bilgilendirir.</p><h3>Nasıl Takip Edilir?</h3><p>Sportoonline hesabınıza giriş yapın ve "Siparişlerim" bölümünden sipariş durumunuzu görebilirsiniz. Ayrıca size gönderilen kargo takip numarası ile kargo firmasının web sitesinden de takip yapabilirsiniz.</p><h3>Sipariş Durumları</h3><p><strong>Onay Bekliyor:</strong> Siparişiniz alındı, ödeme onayı bekleniyor.<br/><strong>Hazırlanıyor:</strong> Siparişiniz mağaza tarafından hazırlanıyor.<br/><strong>Kargoya Verildi:</strong> Siparişiniz kargo firmasına teslim edildi.<br/><strong>Teslim Edildi:</strong> Sportoonline siparişiniz başarıyla teslim edildi.</p>',
                'content_en' => '<h2>Track Order</h2><p>Easily check the status of your Sportoonline orders and monitor delivery updates in real-time.</p><p>After placing your order on Sportoonline, you will want to know exactly where it is and when it will arrive. Our real-time tracking system keeps you informed at every step.</p><h3>How to Track?</h3><p>Log in to your Sportoonline account and check your order status from the "My Orders" section. You can also track via the shipping company website using the tracking number sent to you.</p><h3>Order Statuses</h3><p><strong>Pending Confirmation:</strong> Your order has been received, awaiting payment confirmation.<br/><strong>Preparing:</strong> Your order is being prepared by the store.<br/><strong>Shipped:</strong> Your order has been handed over to the shipping company.<br/><strong>Delivered:</strong> Your Sportoonline order has been successfully delivered.</p>',
                'meta_title_tr' => 'Sipariş Takibi | Sportoonline',
                'meta_title_en' => 'Track Order | Sportoonline',
                'meta_description_tr' => 'Sportoonline siparişlerinizin durumunu anlık olarak takip edin.',
                'meta_description_en' => 'Track the status of your Sportoonline orders in real-time.',
                'meta_keywords_tr' => 'sportoonline sipariş takibi, kargo takip, sipariş durumu',
                'meta_keywords_en' => 'sportoonline order tracking, shipment tracking, order status',
            ],
        ];

        $dynamicSlugs = array_column($pages, 'slug');
        $specialSlugs = ['about', 'contact', 'become-a-seller'];

        // Remove dynamic pages that are not in our list (don't touch special pages)
        $oldPageIds = Page::whereNotIn('slug', array_merge($dynamicSlugs, $specialSlugs))->pluck('id');
        if ($oldPageIds->isNotEmpty()) {
            DB::table('translations')
                ->where('translatable_type', $type)
                ->whereIn('translatable_id', $oldPageIds)
                ->delete();
            Page::whereIn('id', $oldPageIds)->delete();
        }

        // Clean up orphaned translations (pages that no longer exist)
        $existingPageIds = Page::pluck('id');
        DB::table('translations')
            ->where('translatable_type', $type)
            ->whereNotIn('translatable_id', $existingPageIds)
            ->delete();

        // Clean up non-df/en translations for special pages
        $specialPageIds = Page::whereIn('slug', $specialSlugs)->pluck('id');
        if ($specialPageIds->isNotEmpty()) {
            DB::table('translations')
                ->where('translatable_type', $type)
                ->whereIn('translatable_id', $specialPageIds)
                ->whereNotIn('language', ['df', 'en'])
                ->delete();
        }

        foreach ($pages as $page) {
            $titleTr = $page['title_tr'];
            $titleEn = $page['title_en'];
            $contentTr = $page['content_tr'];
            $contentEn = $page['content_en'];
            $metaTitleTr = $page['meta_title_tr'];
            $metaTitleEn = $page['meta_title_en'];
            $metaDescTr = $page['meta_description_tr'];
            $metaDescEn = $page['meta_description_en'];
            $metaKeywordsTr = $page['meta_keywords_tr'];
            $metaKeywordsEn = $page['meta_keywords_en'];

            // Remove translation fields from page data
            $pageData = array_diff_key($page, array_flip([
                'title_tr', 'title_en', 'content_tr', 'content_en',
                'meta_title_tr', 'meta_title_en', 'meta_description_tr', 'meta_description_en',
                'meta_keywords_tr', 'meta_keywords_en',
            ]));

            $pageModel = Page::updateOrCreate(
                ['slug' => $page['slug'], 'theme_name' => $page['theme_name']],
                array_merge($pageData, [
                    'title' => $titleTr,
                    'content' => $contentTr,
                    'meta_title' => $metaTitleTr,
                    'meta_description' => $metaDescTr,
                    'meta_keywords' => $metaKeywordsTr,
                ])
            );

            if (Schema::hasTable('translations')) {
                // Remove non-df/en translations for this page
                DB::table('translations')
                    ->where('translatable_type', $type)
                    ->where('translatable_id', $pageModel->id)
                    ->whereNotIn('language', ['df', 'en'])
                    ->delete();

                // Turkish (df = default)
                $this->addTranslation($pageModel->id, $type, 'df', 'title', $titleTr);
                $this->addTranslation($pageModel->id, $type, 'df', 'content', $contentTr);
                $this->addTranslation($pageModel->id, $type, 'df', 'meta_title', $metaTitleTr);
                $this->addTranslation($pageModel->id, $type, 'df', 'meta_description', $metaDescTr);
                $this->addTranslation($pageModel->id, $type, 'df', 'meta_keywords', $metaKeywordsTr);

                // English
                $this->addTranslation($pageModel->id, $type, 'en', 'title', $titleEn);
                $this->addTranslation($pageModel->id, $type, 'en', 'content', $contentEn);
                $this->addTranslation($pageModel->id, $type, 'en', 'meta_title', $metaTitleEn);
                $this->addTranslation($pageModel->id, $type, 'en', 'meta_description', $metaDescEn);
                $this->addTranslation($pageModel->id, $type, 'en', 'meta_keywords', $metaKeywordsEn);
            }
        }

        $this->command->info('PageSeeder: 7 dynamic pages seeded with TR(df)/EN translations for Sportoonline.');
    }

    private function addTranslation($id, $type, $lang, $key, $value): void
    {
        DB::table('translations')->updateOrInsert(
            [
                'translatable_id' => $id,
                'translatable_type' => $type,
                'language' => $lang,
                'key' => $key,
            ],
            [
                'value' => $value,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}
