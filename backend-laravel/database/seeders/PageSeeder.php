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

        // ── 1. Dynamic pages (HTML content) ──
        $dynamicPages = $this->getDynamicPages();

        // ── 2. Special pages (JSON page-builder content) ──
        $specialPages = $this->getSpecialPages();

        $allPages = array_merge($dynamicPages, $specialPages);

        // ── 3. Dedup: remove duplicate slug+theme rows ──
        $this->removeDuplicates($type);

        // ── 4. Remove pages not in our list ──
        $validKeys = array_map(fn($p) => $p['slug'] . '|' . $p['theme_name'], $allPages);
        $existingPages = Page::all(['id', 'slug', 'theme_name']);
        $toDelete = $existingPages->filter(fn($p) => !in_array($p->slug . '|' . $p->theme_name, $validKeys));
        if ($toDelete->isNotEmpty()) {
            $ids = $toDelete->pluck('id');
            DB::table('translations')->where('translatable_type', $type)->whereIn('translatable_id', $ids)->delete();
            Page::whereIn('id', $ids)->delete();
            $this->command->info('PageSeeder: Deleted ' . $ids->count() . ' unnecessary page(s).');
        }

        // ── 5. Clean orphaned translations ──
        $existingIds = Page::pluck('id');
        DB::table('translations')
            ->where('translatable_type', $type)
            ->when($existingIds->isNotEmpty(), fn($q) => $q->whereNotIn('translatable_id', $existingIds))
            ->when($existingIds->isEmpty(), fn($q) => $q)
            ->delete();

        // ── 6. Seed all pages ──
        foreach ($allPages as $page) {
            $tr = $page['translations']['tr'];
            $en = $page['translations']['en'];

            $pageData = array_diff_key($page, ['translations' => true]);

            $pageModel = Page::updateOrCreate(
                ['slug' => $page['slug'], 'theme_name' => $page['theme_name']],
                array_merge($pageData, [
                    'title' => $tr['title'],
                    'content' => $tr['content'],
                    'meta_title' => $tr['meta_title'] ?? '',
                    'meta_description' => $tr['meta_description'] ?? '',
                    'meta_keywords' => $tr['meta_keywords'] ?? '',
                ])
            );

            if (Schema::hasTable('translations')) {
                // Remove non-df/en translations
                DB::table('translations')
                    ->where('translatable_type', $type)
                    ->where('translatable_id', $pageModel->id)
                    ->whereNotIn('language', ['df', 'en'])
                    ->delete();

                // df = Turkish (default)
                foreach ($tr as $key => $value) {
                    $this->addTranslation($pageModel->id, $type, 'df', $key, $value);
                }
                // en = English
                foreach ($en as $key => $value) {
                    $this->addTranslation($pageModel->id, $type, 'en', $key, $value);
                }
            }
        }

        $count = count($allPages);
        $this->command->info("PageSeeder: {$count} pages seeded (dynamic + special) with TR(df)/EN translations for Sportoonline.");
    }

    /**
     * Remove duplicate rows with the same slug+theme_name (keep oldest).
     */
    private function removeDuplicates(string $type): void
    {
        $pages = Page::orderBy('id')->get(['id', 'slug', 'theme_name']);
        $seen = [];
        $dupeIds = [];

        foreach ($pages as $p) {
            $key = $p->slug . '|' . $p->theme_name;
            if (isset($seen[$key])) {
                $dupeIds[] = $p->id;
            } else {
                $seen[$key] = $p->id;
            }
        }

        if (!empty($dupeIds)) {
            DB::table('translations')->where('translatable_type', $type)->whereIn('translatable_id', $dupeIds)->delete();
            Page::whereIn('id', $dupeIds)->delete();
            $this->command->info('PageSeeder: Removed ' . count($dupeIds) . ' duplicate page(s).');
        }
    }

    /**
     * 7 dynamic pages with HTML content.
     */
    private function getDynamicPages(): array
    {
        return [
            [
                'slug' => 'kullanim-kosullari',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Kullanım Koşulları',
                        'content' => '<h2>Kullanım Koşulları</h2><p>Sportoonline\'a hoş geldiniz. Bu Kullanım Koşulları, sportoonline.com üzerinden sunulan hizmetlerin kullanımına ilişkin kuralları ve düzenlemeleri belirler.</p><p>Sportoonline\'a erişerek veya kullanarak bu koşulları kabul etmiş olursunuz. Koşullarımızı kabul etmiyorsanız, lütfen sitemizi kullanmayınız.</p><h3>1. Hesap Oluşturma</h3><p>Sportoonline\'dan alışveriş yapabilmek için bir hesap oluşturmanız gerekebilir. Hesap bilgilerinizin doğruluğunu ve güvenliğini sağlamak sizin sorumluluğunuzdadır.</p><h3>2. Sipariş ve Ödeme</h3><p>Sportoonline üzerinden verilen tüm siparişler, ödeme onayından sonra işleme alınır. Ödeme işlemleri güvenli ödeme altyapısı ile gerçekleştirilir.</p><h3>3. Ürün Bilgileri</h3><p>Sportoonline\'daki mağazalar, spor ürünleriyle ilgili doğru ve eksiksiz bilgi sağlamakla yükümlüdür. Sportoonline, mağazaların sağladığı bilgilerin doğruluğundan sorumlu değildir.</p><h3>4. Fikri Mülkiyet</h3><p>Sportoonline\'daki tüm içerikler, logolar ve tasarımlar fikri mülkiyet haklarıyla korunmaktadır. İzinsiz kullanım yasaktır.</p><h3>5. Sorumluluk Sınırlaması</h3><p>Sportoonline, yasaların izin verdiği ölçüde, dolaylı veya sonuç olarak ortaya çıkan zararlardan sorumlu tutulamaz.</p>',
                        'meta_title' => 'Kullanım Koşulları | Sportoonline',
                        'meta_description' => 'Sportoonline kullanım koşullarını ve kurallarını öğrenin.',
                        'meta_keywords' => 'sportoonline kullanım koşulları, şartlar, kurallar',
                    ],
                    'en' => [
                        'title' => 'Terms and Conditions',
                        'content' => '<h2>Terms and Conditions</h2><p>Welcome to Sportoonline. These Terms and Conditions outline the rules and regulations for the use of services offered through sportoonline.com.</p><p>By accessing or using Sportoonline, you agree to these terms. If you do not agree with our terms, please do not use our site.</p><h3>1. Account Creation</h3><p>You may need to create an account to shop on Sportoonline. You are responsible for ensuring the accuracy and security of your account information.</p><h3>2. Orders and Payment</h3><p>All orders placed through Sportoonline are processed after payment confirmation. Payment transactions are carried out through a secure payment infrastructure.</p><h3>3. Product Information</h3><p>Stores on Sportoonline are responsible for providing accurate and complete information about their sports products. Sportoonline is not responsible for the accuracy of information provided by stores.</p><h3>4. Intellectual Property</h3><p>All content, logos, and designs on Sportoonline are protected by intellectual property rights. Unauthorized use is prohibited.</p><h3>5. Limitation of Liability</h3><p>Sportoonline cannot be held responsible for indirect or consequential damages to the extent permitted by law.</p>',
                        'meta_title' => 'Terms and Conditions | Sportoonline',
                        'meta_description' => 'Learn about Sportoonline usage terms and conditions.',
                        'meta_keywords' => 'sportoonline terms and conditions, rules, regulations',
                    ],
                ],
            ],
            [
                'slug' => 'gizlilik-politikasi',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Gizlilik Politikası',
                        'content' => '<h2>Gizlilik Politikası</h2><p>Sportoonline olarak gizliliğiniz bizim için önemlidir. Bu Gizlilik Politikası, kişisel bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.</p><h3>1. Toplanan Bilgiler</h3><p>Ad, e-posta adresi, telefon numarası, teslimat adresi ve ödeme bilgileri gibi kişisel bilgilerinizi topluyoruz.</p><h3>2. Bilgilerin Kullanımı</h3><p>Toplanan bilgiler; siparişlerinizi işlemek, Sportoonline hesabınızı yönetmek, size daha iyi spor ürünleri deneyimi sunmak ve yasal yükümlülüklerimizi yerine getirmek için kullanılır.</p><h3>3. Bilgi Güvenliği</h3><p>Sportoonline, kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri uygulamaktadır. Verileriniz SSL şifreleme ile korunmaktadır.</p><h3>4. Çerezler</h3><p>Sportoonline, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Tarayıcı ayarlarınızdan çerez tercihlerinizi yönetebilirsiniz.</p><h3>5. Üçüncü Taraf Paylaşımı</h3><p>Kişisel bilgileriniz, yasal zorunluluklar dışında üçüncü taraflarla paylaşılmaz.</p>',
                        'meta_title' => 'Gizlilik Politikası | Sportoonline',
                        'meta_description' => 'Sportoonline\'da kişisel bilgilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu öğrenin.',
                        'meta_keywords' => 'sportoonline gizlilik politikası, kişisel veriler, veri koruma',
                    ],
                    'en' => [
                        'title' => 'Privacy Policy',
                        'content' => '<h2>Privacy Policy</h2><p>At Sportoonline, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p><h3>1. Information Collected</h3><p>We collect personal information such as name, email address, phone number, delivery address, and payment details.</p><h3>2. Use of Information</h3><p>Collected information is used to process your orders, manage your Sportoonline account, provide a better sports products experience, and fulfill our legal obligations.</p><h3>3. Information Security</h3><p>Sportoonline implements industry-standard security measures to protect your personal information. Your data is protected with SSL encryption.</p><h3>4. Cookies</h3><p>Sportoonline uses cookies to improve user experience. You can manage your cookie preferences from your browser settings.</p><h3>5. Third-Party Sharing</h3><p>Your personal information will not be shared with third parties except as required by law.</p>',
                        'meta_title' => 'Privacy Policy | Sportoonline',
                        'meta_description' => 'Learn how your personal information is collected, used, and protected on Sportoonline.',
                        'meta_keywords' => 'sportoonline privacy policy, personal data, data protection',
                    ],
                ],
            ],
            [
                'slug' => 'iade-degisim',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'İade Politikası',
                        'content' => '<h2>İade ve İptal Politikası</h2><p>Sportoonline olarak müşterilerimize sorunsuz bir alışveriş deneyimi sunmayı hedefliyoruz. İade ve iptal koşullarımızı lütfen dikkatlice okuyunuz.</p><h3>1. İade Koşulları</h3><p>Sportoonline\'dan satın aldığınız spor ürünlerini teslim tarihinden itibaren 14 gün içinde iade edebilirsiniz. İade edilecek ürünler kullanılmamış, orijinal ambalajında ve etiketleri sağlam olmalıdır.</p><h3>2. İade Süreci</h3><p>İade talebinizi Sportoonline hesabınız üzerinden oluşturabilirsiniz. Talebiniz onaylandıktan sonra iade kargo kodunuz tarafınıza iletilecektir.</p><h3>3. Geri Ödeme</h3><p>İade edilen ürün kontrolü tamamlandıktan sonra, geri ödeme 5-10 iş günü içinde orijinal ödeme yönteminize yapılacaktır.</p><h3>4. İade Edilemeyen Ürünler</h3><p>Kişiye özel üretilmiş spor ürünleri, ambalajı açılmış hijyen ürünleri ve kullanılmış spor ekipmanları iade edilemez.</p>',
                        'meta_title' => 'İade Politikası | Sportoonline',
                        'meta_description' => 'Sportoonline iade ve iptal koşulları hakkında bilgi edinin.',
                        'meta_keywords' => 'sportoonline iade politikası, iade koşulları, geri ödeme',
                    ],
                    'en' => [
                        'title' => 'Refund Policy',
                        'content' => '<h2>Refund and Return Policy</h2><p>At Sportoonline, we aim to provide a seamless shopping experience for our customers. Please read our refund and return conditions carefully.</p><h3>1. Return Conditions</h3><p>You can return sports products purchased from Sportoonline within 14 days from the delivery date. Returned products must be unused, in original packaging, and with tags intact.</p><h3>2. Return Process</h3><p>You can create a return request through your Sportoonline account. After your request is approved, a return shipping code will be provided to you.</p><h3>3. Refund</h3><p>After the returned product inspection is completed, the refund will be made to your original payment method within 5-10 business days.</p><h3>4. Non-Returnable Products</h3><p>Custom-made sports products, opened hygiene products, and used sports equipment cannot be returned.</p>',
                        'meta_title' => 'Refund Policy | Sportoonline',
                        'meta_description' => 'Learn about Sportoonline refund and return conditions.',
                        'meta_keywords' => 'sportoonline refund policy, return conditions, money back',
                    ],
                ],
            ],
            [
                'slug' => 'kargo-politikasi',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Kargo ve Teslimat Politikası',
                        'content' => '<h2>Kargo ve Teslimat Politikası</h2><p>Sportoonline olarak spor ürünlerinizi doğru, sağlam ve her zaman zamanında teslim etmeye kararlıyız.</p><h3>1. Kargo Süreleri</h3><p>Sportoonline siparişleriniz, ödeme onayından sonra 1-3 iş günü içinde kargoya verilir. Teslimat süresi bulunduğunuz bölgeye göre 2-7 iş günü arasında değişmektedir.</p><h3>2. Kargo Ücreti</h3><p>Kargo ücreti, sipariş tutarına ve teslimat adresine göre belirlenir. Belirli tutar üzerindeki siparişlerde ücretsiz kargo kampanyası geçerlidir.</p><h3>3. Kargo Takibi</h3><p>Sportoonline siparişiniz kargoya verildikten sonra, kargo takip numarası e-posta ve SMS ile tarafınıza iletilir. Sportoonline hesabınız üzerinden de kargo durumunuzu takip edebilirsiniz.</p><h3>4. Teslimat Adresi</h3><p>Teslimat adresinizin doğruluğundan siz sorumlusunuz. Yanlış adres bilgisi nedeniyle yaşanan gecikmelerden Sportoonline sorumlu tutulamaz.</p>',
                        'meta_title' => 'Kargo ve Teslimat Politikası | Sportoonline',
                        'meta_description' => 'Sportoonline kargo süreleri, ücretleri ve teslimat koşulları hakkında bilgi edinin.',
                        'meta_keywords' => 'sportoonline kargo, teslimat, kargo takibi, kargo politikası',
                    ],
                    'en' => [
                        'title' => 'Shipping & Delivery Policy',
                        'content' => '<h2>Shipping & Delivery Policy</h2><p>At Sportoonline, we are committed to delivering your sports products accurately, safely, and always on time.</p><h3>1. Shipping Timeframes</h3><p>Your Sportoonline orders are shipped within 1-3 business days after payment confirmation. Delivery time varies between 2-7 business days depending on your location.</p><h3>2. Shipping Fee</h3><p>Shipping fee is determined based on the order amount and delivery address. Free shipping is available for orders above a certain amount.</p><h3>3. Shipment Tracking</h3><p>After your Sportoonline order is shipped, the tracking number will be sent to you via email and SMS. You can also track your shipment status through your Sportoonline account.</p><h3>4. Delivery Address</h3><p>You are responsible for the accuracy of your delivery address. Sportoonline cannot be held responsible for delays caused by incorrect address information.</p>',
                        'meta_title' => 'Shipping & Delivery Policy | Sportoonline',
                        'meta_description' => 'Learn about Sportoonline shipping timeframes, fees, and delivery conditions.',
                        'meta_keywords' => 'sportoonline shipping, delivery, shipment tracking, shipping policy',
                    ],
                ],
            ],
            [
                'slug' => 'customer-service',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Müşteri Hizmetleri',
                        'content' => '<h2>Müşteri Hizmetleri</h2><p>Sportoonline siparişleriniz, ödemeleriniz, iadeleriniz ve hesap sorunlarınız konusunda yardım alın.</p><p>Sportoonline Müşteri Hizmetleri Merkezine hoş geldiniz. Amacımız, spor alışverişi deneyiminizin sorunsuz ve keyifli olmasını sağlamaktır.</p><h3>Sıkça Sorulan Sorular</h3><p>Birçok yaygın sorunun cevabını SSS bölümümüzde bulabilirsiniz. Siparişleriniz, ödeme yöntemleri, iade süreçleri ve hesap yönetimi hakkında detaylı bilgilere ulaşabilirsiniz.</p><h3>Bize Ulaşın</h3><p>Sportoonline müşteri hizmetleri ekibimize e-posta veya iletişim formumuz aracılığıyla ulaşabilirsiniz. Talebinize en kısa sürede yanıt vermeye çalışıyoruz.</p>',
                        'meta_title' => 'Müşteri Hizmetleri | Sportoonline',
                        'meta_description' => 'Sportoonline siparişler, ödemeler, iadeler ve hesap sorunları konusunda yardım alın.',
                        'meta_keywords' => 'sportoonline müşteri hizmetleri, destek, yardım',
                    ],
                    'en' => [
                        'title' => 'Customer Service',
                        'content' => '<h2>Customer Service</h2><p>Get help with your Sportoonline orders, payments, returns, and account issues.</p><p>Welcome to the Sportoonline Customer Service Center. Our goal is to ensure your sports shopping experience is smooth and enjoyable.</p><h3>Frequently Asked Questions</h3><p>You can find answers to many common issues in our FAQ section. Access detailed information about your orders, payment methods, return processes, and account management.</p><h3>Contact Us</h3><p>You can reach our Sportoonline customer service team via email or our contact form. We strive to respond to your request as soon as possible.</p>',
                        'meta_title' => 'Customer Service | Sportoonline',
                        'meta_description' => 'Get help with Sportoonline orders, payments, returns, and account issues.',
                        'meta_keywords' => 'sportoonline customer service, support, help',
                    ],
                ],
            ],
            [
                'slug' => 'product-support',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Ürün Desteği',
                        'content' => '<h2>Ürün Desteği</h2><p>Sportoonline\'dan aldığınız spor ürünleriyle ilgili sorunlar, arızalar veya mağaza iletişimi konusunda yardım alın.</p><p>Spor ürünlerinde sorunlar yaşanabilir — ve böyle olduğunda, bunları hızlıca çözmenize yardımcı olmak için buradayız.</p><h3>Ürün Arızası</h3><p>Sportoonline\'dan arızalı veya hasarlı bir spor ürünü aldıysanız, teslimat tarihinden itibaren 3 gün içinde bize bildirin. Fotoğraflı kanıt ile talebinizi Sportoonline hesabınız üzerinden oluşturabilirsiniz.</p><h3>Mağaza İletişimi</h3><p>Spor ürünleriyle ilgili sorularınızı doğrudan Sportoonline mağazasına mesaj göndererek sorabilirsiniz. Mağazalar genellikle 24 saat içinde yanıt vermektedir.</p>',
                        'meta_title' => 'Ürün Desteği | Sportoonline',
                        'meta_description' => 'Sportoonline spor ürünleri sorunları, arızalar ve mağaza iletişimi konusunda destek alın.',
                        'meta_keywords' => 'sportoonline ürün desteği, arıza, mağaza iletişimi, spor ürünleri',
                    ],
                    'en' => [
                        'title' => 'Product Support',
                        'content' => '<h2>Product Support</h2><p>Get help with issues, defects, or store communication regarding sports products purchased from Sportoonline.</p><p>Issues with sports products can happen — and when they do, we are here to help you resolve them quickly.</p><h3>Product Defects</h3><p>If you received a defective or damaged sports product from Sportoonline, please notify us within 3 days of delivery. You can create your request with photo evidence through your Sportoonline account.</p><h3>Store Communication</h3><p>You can ask your sports product-related questions by sending a message directly to the Sportoonline store. Stores typically respond within 24 hours.</p>',
                        'meta_title' => 'Product Support | Sportoonline',
                        'meta_description' => 'Get support for Sportoonline sports product issues, defects, and store communication.',
                        'meta_keywords' => 'sportoonline product support, defect, store communication, sports products',
                    ],
                ],
            ],
            [
                'slug' => 'track-order',
                'theme_name' => 'default',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Sipariş Takibi',
                        'content' => '<h2>Sipariş Takibi</h2><p>Sportoonline siparişlerinizin durumunu kolayca kontrol edin ve teslimat güncellemelerini anlık olarak takip edin.</p><p>Sportoonline\'dan siparişinizi verdikten sonra, nerede olduğunu ve ne zaman teslim edileceğini bilmek istersiniz. Gerçek zamanlı takip sistemimiz her adımda sizi bilgilendirir.</p><h3>Nasıl Takip Edilir?</h3><p>Sportoonline hesabınıza giriş yapın ve "Siparişlerim" bölümünden sipariş durumunuzu görebilirsiniz. Ayrıca size gönderilen kargo takip numarası ile kargo firmasının web sitesinden de takip yapabilirsiniz.</p><h3>Sipariş Durumları</h3><p><strong>Onay Bekliyor:</strong> Siparişiniz alındı, ödeme onayı bekleniyor.<br/><strong>Hazırlanıyor:</strong> Siparişiniz mağaza tarafından hazırlanıyor.<br/><strong>Kargoya Verildi:</strong> Siparişiniz kargo firmasına teslim edildi.<br/><strong>Teslim Edildi:</strong> Sportoonline siparişiniz başarıyla teslim edildi.</p>',
                        'meta_title' => 'Sipariş Takibi | Sportoonline',
                        'meta_description' => 'Sportoonline siparişlerinizin durumunu anlık olarak takip edin.',
                        'meta_keywords' => 'sportoonline sipariş takibi, kargo takip, sipariş durumu',
                    ],
                    'en' => [
                        'title' => 'Track Order',
                        'content' => '<h2>Track Order</h2><p>Easily check the status of your Sportoonline orders and monitor delivery updates in real-time.</p><p>After placing your order on Sportoonline, you will want to know exactly where it is and when it will arrive. Our real-time tracking system keeps you informed at every step.</p><h3>How to Track?</h3><p>Log in to your Sportoonline account and check your order status from the "My Orders" section. You can also track via the shipping company website using the tracking number sent to you.</p><h3>Order Statuses</h3><p><strong>Pending Confirmation:</strong> Your order has been received, awaiting payment confirmation.<br/><strong>Preparing:</strong> Your order is being prepared by the store.<br/><strong>Shipped:</strong> Your order has been handed over to the shipping company.<br/><strong>Delivered:</strong> Your Sportoonline order has been successfully delivered.</p>',
                        'meta_title' => 'Track Order | Sportoonline',
                        'meta_description' => 'Track the status of your Sportoonline orders in real-time.',
                        'meta_keywords' => 'sportoonline order tracking, shipment tracking, order status',
                    ],
                ],
            ],
        ];
    }

    /**
     * 3 special pages with JSON page-builder content.
     */
    private function getSpecialPages(): array
    {
        return [
            // ── About Page ──
            [
                'slug' => 'hakkimizda',
                'theme_name' => 'theme_two',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Hakkımızda',
                        'content' => json_encode([
                            'about_section' => [
                                'title' => 'Sportoonline Hakkında',
                                'subtitle' => 'Sporda Kalite ve Güvenin Adresi',
                                'description' => 'Sportoonline olarak, spor tutkunlarına en kaliteli ürünleri en uygun fiyatlarla sunuyoruz. Güvenli alışveriş deneyimi, hızlı teslimat ve müşteri memnuniyeti önceliğimizdir. Spor giyimden ekipmana kadar geniş ürün yelpazemizle, sporun her alanında yanınızdayız.',
                                'image' => 1302,
                                'image_url' => null,
                            ],
                            'story_section' => [
                                'title' => 'Hikayemiz',
                                'subtitle' => 'Bir tutkudan doğan marka: Sportoonline\'ın spor e-ticaret dünyasındaki yolculuğu',
                                'steps' => [
                                    ['title' => 'Vizyonumuz ve Başlangıcımız', 'subtitle' => 'Spor tutkunlarını en kaliteli ürünlerle buluşturma vizyonuyla yola çıktık', 'image' => 1111],
                                    ['title' => 'Zorlukların Üstesinden Gelmek', 'subtitle' => 'Yenilikçi çözümlerle güvenilir ve güvenli bir spor pazaryeri inşa ettik', 'image' => 1111],
                                    ['title' => 'Gelecek Vizyonumuz', 'subtitle' => 'Sürdürülebilir bir spor e-ticaret ekosistemi kurarak büyümeye devam ediyoruz', 'image' => 1111],
                                ],
                            ],
                            'mission_and_vision_section' => [
                                'title' => 'Misyon ve Vizyonumuz',
                                'subtitle' => 'Sportoonline olarak, spor e-ticaretini dönüştürmek ve sporseverlere en iyi deneyimi sunmak için çalışıyoruz.',
                                'steps' => [
                                    [
                                        'title' => 'Misyonumuz',
                                        'subtitle' => null,
                                        'description' => 'Spor alışverişini kolay, güvenilir ve keyifli hale getirmek. Satıcılara güçlü araçlar ve destek sunarak büyümelerini sağlamak. Rekabetçi fiyatlar, kaliteli ürünler ve üstün hizmet sunmak. Şeffaflık ve güven üzerine kurulu bir pazaryeri oluşturmak.',
                                        'image' => 1115,
                                    ],
                                    [
                                        'title' => 'Vizyonumuz',
                                        'subtitle' => null,
                                        'description' => 'İleri teknolojiyi spor e-ticaretine entegre ederek dijital alışverişi dönüştürmek. Türkiye genelinde milyonlarca alıcı ve satıcıyı bir araya getirmek. İşletmelerin başarılı olduğu ve müşterilerin güvenle alışveriş yaptığı bir topluluk oluşturmak.',
                                        'image' => 1112,
                                    ],
                                ],
                            ],
                            'testimonial_and_success_section' => [
                                'title' => 'Müşteri Yorumları ve Başarı Hikayeleri',
                                'subtitle' => 'Sportoonline müşterilerinin deneyimleri ve başarı hikayeleri',
                                'steps' => [
                                    ['title' => 'Ahmet Yılmaz', 'subtitle' => 'Spor Mağaza Sahibi', 'description' => 'Sportoonline sayesinde mağazamın satışları katlandı. Kolay kullanım ve güçlü altyapı gerçekten fark yaratıyor.', 'image' => 1300],
                                    ['title' => 'Elif Demir', 'subtitle' => 'Fitness Eğitmeni', 'description' => 'Spor ekipmanlarımı Sportoonline\'dan alıyorum. Hızlı teslimat ve kaliteli ürünlerle çok memnunum.', 'image' => 1300],
                                    ['title' => 'Mehmet Kaya', 'subtitle' => 'Sporcu', 'description' => 'Sportoonline\'da aradığım her spor ürününü bulabiliyorum. Fiyat-performans oranı harika.', 'image' => 1300],
                                    ['title' => 'Ayşe Çelik', 'subtitle' => 'Yoga Eğitmeni', 'description' => 'Yoga ekipmanları için en iyi adres. Sportoonline\'ın ürün çeşitliliği ve müşteri hizmetleri mükemmel.', 'image' => 1300],
                                ],
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                        'meta_title' => 'Hakkımızda | Sportoonline',
                        'meta_description' => 'Sportoonline hakkında bilgi edinin. Sporda kalite ve güvenin adresi.',
                        'meta_keywords' => 'sportoonline hakkında, spor e-ticaret, hakkımızda',
                    ],
                    'en' => [
                        'title' => 'About Us',
                        'content' => json_encode([
                            'about_section' => [
                                'title' => 'About Sportoonline',
                                'subtitle' => 'Your Trusted Destination for Quality Sports Products',
                                'description' => 'At Sportoonline, we offer the highest quality sports products at the best prices. A secure shopping experience, fast delivery, and customer satisfaction are our priorities. From sportswear to equipment, we are with you in every area of sports.',
                                'image' => 1302,
                                'image_url' => null,
                            ],
                            'story_section' => [
                                'title' => 'Our Story',
                                'subtitle' => 'A brand born from passion: Sportoonline\'s journey in the sports e-commerce world',
                                'steps' => [
                                    ['title' => 'Our Vision and Beginning', 'subtitle' => 'We set out with a vision to connect sports enthusiasts with the highest quality products', 'image' => 1111],
                                    ['title' => 'Overcoming Challenges', 'subtitle' => 'We built a reliable and secure sports marketplace through innovative solutions', 'image' => 1111],
                                    ['title' => 'Our Future Vision', 'subtitle' => 'Continuing to grow by building a sustainable sports e-commerce ecosystem', 'image' => 1111],
                                ],
                            ],
                            'mission_and_vision_section' => [
                                'title' => 'Our Mission & Vision',
                                'subtitle' => 'At Sportoonline, we work to transform sports e-commerce and provide the best experience for sports enthusiasts.',
                                'steps' => [
                                    [
                                        'title' => 'Our Mission',
                                        'subtitle' => null,
                                        'description' => 'Make sports shopping easy, reliable, and enjoyable. Enable sellers to grow by offering powerful tools and support. Deliver competitive prices, quality products, and exceptional service. Build a marketplace founded on transparency and trust.',
                                        'image' => 1115,
                                    ],
                                    [
                                        'title' => 'Our Vision',
                                        'subtitle' => null,
                                        'description' => 'Transform digital shopping by integrating cutting-edge technology into sports e-commerce. Connect millions of buyers and sellers across Turkey. Create a community where businesses succeed and customers shop with confidence.',
                                        'image' => 1112,
                                    ],
                                ],
                            ],
                            'testimonial_and_success_section' => [
                                'title' => 'Testimonials & Success Stories',
                                'subtitle' => 'Experiences and success stories from Sportoonline customers',
                                'steps' => [
                                    ['title' => 'Ahmet Yılmaz', 'subtitle' => 'Sports Store Owner', 'description' => 'Thanks to Sportoonline, my store sales have multiplied. Easy-to-use interface and strong infrastructure really make a difference.', 'image' => 1300],
                                    ['title' => 'Elif Demir', 'subtitle' => 'Fitness Trainer', 'description' => 'I buy my sports equipment from Sportoonline. Very satisfied with fast delivery and quality products.', 'image' => 1300],
                                    ['title' => 'Mehmet Kaya', 'subtitle' => 'Athlete', 'description' => 'I can find every sports product I need on Sportoonline. The price-performance ratio is great.', 'image' => 1300],
                                    ['title' => 'Ayşe Çelik', 'subtitle' => 'Yoga Instructor', 'description' => 'The best destination for yoga equipment. Sportoonline\'s product variety and customer service are excellent.', 'image' => 1300],
                                ],
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                        'meta_title' => 'About Us | Sportoonline',
                        'meta_description' => 'Learn about Sportoonline. Your trusted destination for quality sports products.',
                        'meta_keywords' => 'sportoonline about, sports e-commerce, about us',
                    ],
                ],
            ],

            // ── Contact Page ──
            [
                'slug' => 'iletisim',
                'theme_name' => 'theme_two',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'İletişim',
                        'content' => json_encode([
                            'contact_form_section' => [
                                'title' => 'Sportoonline',
                                'subtitle' => 'Ekibimizle iletişime geçmekten çekinmeyin. Müşteri destek ekibimiz size 7/24 yardımcı olmak için hazır.',
                            ],
                            'contact_details_section' => [
                                'address' => 'İstanbul, Türkiye',
                                'phone' => '+90 850 000 00 00',
                                'email' => 'info@sportoonline.com',
                                'website' => 'https://sportoonline.com',
                                'image' => 1302,
                                'image_url' => null,
                                'social' => [
                                    ['url' => 'https://www.facebook.com/sportoonline', 'icon' => 'Facebook'],
                                    ['url' => 'https://www.instagram.com/sportoonline', 'icon' => 'Instagram'],
                                    ['url' => 'https://www.linkedin.com/company/sportoonline', 'icon' => 'Linkedin'],
                                ],
                            ],
                            'map_section' => [
                                'coordinates' => ['lat' => 41.0082, 'lng' => 28.9784],
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                        'meta_title' => 'İletişim | Sportoonline',
                        'meta_description' => 'Sportoonline ile iletişime geçin. Sorularınız için bize ulaşın.',
                        'meta_keywords' => 'sportoonline iletişim, bize ulaşın, destek',
                    ],
                    'en' => [
                        'title' => 'Contact',
                        'content' => json_encode([
                            'contact_form_section' => [
                                'title' => 'Sportoonline',
                                'subtitle' => 'Feel free to connect with our team. Our dedicated customer support team is available 24/7 to assist you.',
                            ],
                            'contact_details_section' => [
                                'address' => 'Istanbul, Turkey',
                                'phone' => '+90 850 000 00 00',
                                'email' => 'info@sportoonline.com',
                                'website' => 'https://sportoonline.com',
                                'image' => 1302,
                                'image_url' => null,
                                'social' => [
                                    ['url' => 'https://www.facebook.com/sportoonline', 'icon' => 'Facebook'],
                                    ['url' => 'https://www.instagram.com/sportoonline', 'icon' => 'Instagram'],
                                    ['url' => 'https://www.linkedin.com/company/sportoonline', 'icon' => 'Linkedin'],
                                ],
                            ],
                            'map_section' => [
                                'coordinates' => ['lat' => 41.0082, 'lng' => 28.9784],
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                        'meta_title' => 'Contact | Sportoonline',
                        'meta_description' => 'Get in touch with Sportoonline. Contact us for your questions.',
                        'meta_keywords' => 'sportoonline contact, get in touch, support',
                    ],
                ],
            ],

            // ── Become a Seller Page ──
            [
                'slug' => 'become-a-seller',
                'theme_name' => 'theme_two',
                'page_type' => 'dynamic_page',
                'status' => 'publish',
                'translations' => [
                    'tr' => [
                        'title' => 'Satıcı Ol',
                        'content' => json_encode([
                            'login_register_section' => [
                                'register_title' => 'Satıcı hesabı oluşturun.',
                                'register_subtitle' => 'Kişisel bilgilerinizi girerek hesabınızı oluşturun',
                                'login_title' => 'Giriş Yap',
                                'login_subtitle' => 'Şimdi giriş yapın',
                                'agree_button_title' => null,
                                'background_image' => 1205,
                                'background_image_url' => null,
                            ],
                            'on_board_section' => [
                                'title' => 'Neden Sportoonline\'da Satış Yapmalısınız?',
                                'subtitle' => 'Sportoonline, spor ürünleri satışınızı kolayca yönetmeniz için ihtiyacınız olan tüm araçları sunar',
                                'steps' => [
                                    ['title' => 'Başlayın', 'subtitle' => 'Ücretsiz kaydolun ve başarılı bir satıcı olma yolculuğunuza başlayın.', 'image' => 1209],
                                    ['title' => 'Mağazanızı Kurun', 'subtitle' => 'Mağazanızı özelleştirin, ürünlerinizi sergileyin ve müşteri çekin.', 'image' => 1210],
                                    ['title' => 'Ürünlerinizi Ekleyin', 'subtitle' => 'Spor ürün envanterinizi kolayca listeleyin, yönetin ve optimize edin.', 'image' => 1211],
                                    ['title' => 'Satışa Başlayın', 'subtitle' => 'Alıcılarla bağlantı kurun, siparişleri karşılayın ve satışlarınızı artırın.', 'image' => 1212],
                                    ['title' => 'Kazanın ve Büyüyün', 'subtitle' => 'Gelirinizi artırın ve yeni iş fırsatlarını keşfedin.', 'image' => 1213],
                                    ['title' => 'İşinizi Büyütün', 'subtitle' => 'Sportoonline ile spor e-ticaret işinizi ölçeklendirin.', 'image' => 1214],
                                ],
                            ],
                            'video_section' => [
                                'section_title' => 'Müşterilerimiz Ne Diyor?',
                                'section_subtitle' => 'Sportoonline ile satış yapan mağaza sahiplerinin deneyimlerini dinleyin.',
                                'video_url' => 'https://www.youtube.com/watch?v=otej7WLdPh0',
                            ],
                            'join_benefits_section' => [
                                'title' => 'Neden Sportoonline\'da Satış Yapmalısınız?',
                                'subtitle' => 'Binlerce başarılı satıcıya katılın ve Sportoonline\'ın güçlü e-ticaret platformuyla işinizi büyütün.',
                                'steps' => [
                                    ['title' => 'Milyonlarca Müşteriye Ulaşın', 'subtitle' => 'Spor ürünleri arayan geniş bir kitleyle bağlantı kurarak işinizi genişletin.', 'image' => 1215],
                                    ['title' => 'Kolay Kayıt', 'subtitle' => 'Gizli ücretler veya uzun onay süreçleri olmadan kolayca kaydolun ve satışa başlayın.', 'image' => 1216],
                                    ['title' => 'Kişiselleştirilmiş Mağaza', 'subtitle' => 'Mağazanızı markanıza uygun şekilde özelleştirin.', 'image' => 1217],
                                    ['title' => 'Ürün Yönetimi', 'subtitle' => 'Sezgisel satıcı panelimizle spor ürün envanterinizi kolayca ekleyin ve yönetin.', 'image' => 1218],
                                    ['title' => 'Hızlı ve Güvenilir Kargo', 'subtitle' => 'Sportoonline\'ın güvenilir lojistik ortaklarıyla sorunsuz teslimatlar sağlayın.', 'image' => 1219],
                                    ['title' => 'Güvenli ve Zamanında Ödeme', 'subtitle' => 'Şeffaf ve güvenilir ödeme sistemiyle doğrudan banka hesabınıza ödeme alın.', 'image' => 1220],
                                    ['title' => 'Akıllı Pazarlama Araçları', 'subtitle' => 'Reklam, promosyon ve veriye dayalı pazarlama stratejileriyle satışlarınızı artırın.', 'image' => 1221],
                                    ['title' => 'Özel Satıcı Desteği', 'subtitle' => 'Uzman rehberlik, eğitim kaynakları ve 7/24 destek ile işinizi geliştirin.', 'image' => 1222],
                                ],
                            ],
                            'faq_section' => [
                                'title' => 'Sıkça Sorulan Sorular',
                                'subtitle' => 'Hizmetlerimiz ve politikalarımız hakkında önemli bilgiler ve cevaplar.',
                                'steps' => [
                                    ['question' => 'Sportoonline\'da satıcı olmak ücretsiz mi?', 'answer' => 'Evet, Sportoonline\'da satıcı kaydı tamamen ücretsizdir. Kayıt olduktan sonra hemen mağazanızı oluşturabilir ve spor ürünlerinizi satışa sunabilirsiniz.'],
                                    ['question' => 'Ödeme süreci nasıl işliyor?', 'answer' => 'Satışlarınızdan elde ettiğiniz gelir, belirli periyotlarla banka hesabınıza aktarılır. Tüm ödemeler güvenli altyapımız üzerinden şeffaf bir şekilde gerçekleştirilir.'],
                                    ['question' => 'Hangi tür spor ürünlerini satabilirim?', 'answer' => 'Spor giyim, ayakkabı, ekipman, aksesuar, fitness malzemeleri ve daha birçok spor kategorisinde ürün satabilirsiniz.'],
                                    ['question' => 'Kargo sürecini nasıl yönetiyorsunuz?', 'answer' => 'Sportoonline\'ın anlaşmalı kargo firmalarıyla hızlı ve güvenilir teslimat yapabilirsiniz. Kargo takibi otomatik olarak müşterilere iletilir.'],
                                    ['question' => 'Satıcı desteği nasıl sağlanıyor?', 'answer' => 'Sportoonline satıcı destek ekibi, mağaza kurulumu, ürün yönetimi ve pazarlama konularında size 7/24 yardımcı olmak için hazırdır.'],
                                ],
                            ],
                            'contact_section' => [
                                'title' => 'Yardıma mı ihtiyacınız var? Uzmanlarımız burada.',
                                'subtitle' => 'Uzmanlarımız ürünlerimiz, hizmetlerimiz veya daha fazlası hakkında her türlü sorunuza yardımcı olmak için burada. İşleri sizin için kolaylaştıralım.',
                                'agree_button_title' => 'Şartları ve koşulları kabul ediyorum.',
                                'image' => 1223,
                                'image_url' => null,
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                        'meta_title' => 'Satıcı Ol | Sportoonline',
                        'meta_description' => 'Sportoonline\'da satıcı olun. Spor ürünlerinizi milyonlarca müşteriye ulaştırın.',
                        'meta_keywords' => 'sportoonline satıcı ol, spor mağaza aç, spor ürün sat',
                    ],
                    'en' => [
                        'title' => 'Become a Seller',
                        'content' => json_encode([
                            'login_register_section' => [
                                'register_title' => 'Create seller account.',
                                'register_subtitle' => 'Enter your personal data to create your account',
                                'login_title' => 'Log In',
                                'login_subtitle' => 'Log in now',
                                'agree_button_title' => null,
                                'background_image' => 1205,
                                'background_image_url' => null,
                            ],
                            'on_board_section' => [
                                'title' => 'Why Start Selling on Sportoonline?',
                                'subtitle' => 'Sportoonline provides all the tools you need to easily manage your sports product sales',
                                'steps' => [
                                    ['title' => 'Get Started', 'subtitle' => 'Sign up for free and begin your journey as a successful seller.', 'image' => 1209],
                                    ['title' => 'Build Your Store', 'subtitle' => 'Customize your storefront, showcase your products, and attract customers.', 'image' => 1210],
                                    ['title' => 'Add Your Products', 'subtitle' => 'List, manage, and optimize your sports product inventory with ease.', 'image' => 1211],
                                    ['title' => 'Start Selling', 'subtitle' => 'Connect with buyers, fulfill orders, and grow your sales.', 'image' => 1212],
                                    ['title' => 'Earn & Grow', 'subtitle' => 'Boost your revenue and unlock new business opportunities.', 'image' => 1213],
                                    ['title' => 'Scale Your Business', 'subtitle' => 'Scale your sports e-commerce business with Sportoonline.', 'image' => 1214],
                                ],
                            ],
                            'video_section' => [
                                'section_title' => 'What Our Customers Say',
                                'section_subtitle' => 'Listen to the experiences of store owners selling on Sportoonline.',
                                'video_url' => 'https://www.youtube.com/watch?v=otej7WLdPh0',
                            ],
                            'join_benefits_section' => [
                                'title' => 'Why Sell on Sportoonline?',
                                'subtitle' => 'Join thousands of successful sellers and grow your business with Sportoonline\'s powerful e-commerce platform.',
                                'steps' => [
                                    ['title' => 'Reach Millions of Customers', 'subtitle' => 'Expand your business by connecting with a vast audience looking for sports products.', 'image' => 1215],
                                    ['title' => 'Hassle-Free Registration', 'subtitle' => 'Sign up effortlessly and start selling without hidden fees or long approval processes.', 'image' => 1216],
                                    ['title' => 'Personalized Storefront', 'subtitle' => 'Customize your store to match your brand identity.', 'image' => 1217],
                                    ['title' => 'Product Management', 'subtitle' => 'Easily add and manage your sports product inventory with our intuitive seller dashboard.', 'image' => 1218],
                                    ['title' => 'Fast & Reliable Shipping', 'subtitle' => 'Ensure smooth deliveries with Sportoonline\'s trusted logistics partners.', 'image' => 1219],
                                    ['title' => 'Secure & Timely Payments', 'subtitle' => 'Get paid directly to your bank account with a transparent and reliable payment system.', 'image' => 1220],
                                    ['title' => 'Smart Marketing Tools', 'subtitle' => 'Boost your sales with advertising, promotions, and data-driven marketing strategies.', 'image' => 1221],
                                    ['title' => 'Dedicated Seller Support', 'subtitle' => 'Get expert guidance, training resources, and 24/7 assistance for your business.', 'image' => 1222],
                                ],
                            ],
                            'faq_section' => [
                                'title' => 'Frequently Asked Questions',
                                'subtitle' => 'Key information and answers regarding our services and policies.',
                                'steps' => [
                                    ['question' => 'Is it free to become a seller on Sportoonline?', 'answer' => 'Yes, seller registration on Sportoonline is completely free. After signing up, you can immediately create your store and start listing your sports products.'],
                                    ['question' => 'How does the payment process work?', 'answer' => 'Your sales revenue is transferred to your bank account at regular intervals. All payments are processed transparently through our secure infrastructure.'],
                                    ['question' => 'What types of sports products can I sell?', 'answer' => 'You can sell products in many sports categories including sportswear, shoes, equipment, accessories, fitness supplies, and more.'],
                                    ['question' => 'How do you handle shipping?', 'answer' => 'You can make fast and reliable deliveries with Sportoonline\'s contracted shipping companies. Shipping tracking is automatically communicated to customers.'],
                                    ['question' => 'How is seller support provided?', 'answer' => 'The Sportoonline seller support team is available 24/7 to help you with store setup, product management, and marketing.'],
                                ],
                            ],
                            'contact_section' => [
                                'title' => 'Need help? Our experts are here for you.',
                                'subtitle' => 'Our experts are here to assist with any questions about our products, services, or more. Let us make things easier for you.',
                                'agree_button_title' => 'I agree to the terms and conditions.',
                                'image' => 1223,
                                'image_url' => null,
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                        'meta_title' => 'Become a Seller | Sportoonline',
                        'meta_description' => 'Become a seller on Sportoonline. Reach millions of customers with your sports products.',
                        'meta_keywords' => 'sportoonline become a seller, open sports store, sell sports products',
                    ],
                ],
            ],
        ];
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
                'value' => $value ?? '',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}
