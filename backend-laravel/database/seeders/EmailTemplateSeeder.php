<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\Translation;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Seed email templates — TR (root) + EN (translation).
     */
    public function run(): void
    {
        if (!Schema::hasTable('email_templates')) {
            $this->command->warn('EmailTemplateSeeder: email_templates table does not exist. Skipping...');
            return;
        }

        // Clear existing translations for email templates
        if (Schema::hasTable('translations')) {
            Translation::where('translatable_type', 'App\Models\EmailTemplate')->delete();
        }

        // Clear existing templates
        DB::table('email_templates')->delete();

        $now = Carbon::now();

        // ── Root values (Turkish — default language) ──────────────────────
        $templates = [
            [
                'type' => 'register',
                'name' => 'Kullanıcı Kaydı',
                'subject' => 'Sportoonline\'a Hoş Geldiniz!',
                'body' => '<h1>Hoş geldiniz @name!</h1>
<p>Sportoonline ailesine katıldığınız için teşekkür ederiz.</p>
<ul>
    <li>Ad Soyad: @name</li>
    <li>E-posta: @email</li>
    <li>Telefon: @phone</li>
</ul>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'seller-register',
                'name' => 'Satıcı Kaydı Onayı',
                'subject' => '@site_name - Satıcı Kaydınız Başarılı!',
                'body' => '<h1>Hoş Geldiniz @name!</h1>
<p>@site_name platformunda satıcı hesabınız başarıyla oluşturuldu.</p>
<ul>
    <li>Ad Soyad: @name</li>
    <li>E-posta: @email</li>
    <li>Telefon: @phone</li>
</ul>
<h2>Sonraki Adımlar</h2>
<p>Mağazanızı oluşturmak ve ürünlerinizi yönetmek için <strong>Satıcı Paneli</strong>ne giriş yapın:</p>
<p>👉 <strong>Giriş adresi:</strong> Satıcı Paneli → <code>/seller/signin</code></p>
<p>👉 <strong>Giriş e-postanız:</strong> @email</p>
<p>Satıcı panelinizden şunları yapabilirsiniz:</p>
<ul>
    <li>Mağazanızı oluşturun ve düzenleyin</li>
    <li>Ürünlerinizi ekleyin</li>
    <li>Siparişlerinizi yönetin</li>
    <li>Kazançlarınızı takip edin</li>
</ul>
<p>Başarılar dileriz!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'seller-register-for-admin',
                'name' => 'Yeni Satıcı Kaydı (Admin)',
                'subject' => 'Yeni Satıcı Katıldı: @name',
                'body' => '<h1>Merhaba Admin, Yeni Bir Satıcı Katıldı!</h1>
<ul>
    <li>Ad Soyad: @name</li>
    <li>E-posta: @email</li>
    <li>Telefon: @phone</li>
</ul>
<p>Satıcıyı admin panelinden inceleyebilirsiniz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'password-reset',
                'name' => 'Şifre Sıfırlama',
                'subject' => 'Sportoonline Şifre Sıfırlama Talebi',
                'body' => '<h1>Merhaba @name,</h1>
<p>Şifrenizi sıfırlamak için bir talep aldık. Aşağıdaki kodu kullanın:</p>
<h2>@reset_code</h2>
<p>Bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'store-creation',
                'name' => 'Yeni Mağaza Oluşturuldu',
                'subject' => 'Sportoonline\'da Yeni Mağazanız Oluşturuldu',
                'body' => '<h1>Merhaba @owner_name,</h1>
<p>Mağazanız <strong>@store_name</strong> başarıyla oluşturuldu!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'subscription-expired',
                'name' => 'Abonelik Süresi Doldu',
                'subject' => 'Abonelik Süreniz Doldu!',
                'body' => '<h1>Merhaba @owner_name,</h1>
<p><strong>@store_name</strong> mağazanızın aboneliği @expiry_date tarihinde sona erdi.</p>
<p>Hizmetlerimizi kullanmaya devam etmek için lütfen aboneliğinizi yenileyin.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'subscription-renewed',
                'name' => 'Abonelik Yenileme Onayı',
                'subject' => 'Aboneliğiniz Başarıyla Yenilendi!',
                'body' => '<h1>Merhaba @owner_name,</h1>
<p><strong>@store_name</strong> mağazanızın aboneliği başarıyla yenilendi.</p>
<p>Yeni Bitiş Tarihi: @new_expiry_date</p>
<p>Bizimle kaldığınız için teşekkür ederiz!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-created',
                'name' => 'Yeni Sipariş Oluşturuldu',
                'subject' => 'Siparişiniz Alındı!',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Siparişiniz (Sipariş No: @order_id) başarıyla oluşturuldu.</p>
<p>Sipariş Tutarı: @order_amount</p>
<p>Sipariş durumunuz değiştiğinde sizi bilgilendireceğiz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-created-store',
                'name' => 'Mağazanıza Yeni Sipariş',
                'subject' => 'Mağazanıza Yeni Sipariş Geldi!',
                'body' => '<h1>Merhaba @store_owner_name,</h1>
<p><strong>@store_name</strong> mağazanıza yeni bir sipariş geldi (Sipariş No: @order_id).</p>
<p>Sipariş Tutarı: @order_amount</p>
<p>Lütfen siparişi en kısa sürede işleme alın.</p>
<p>👉 Satıcı Paneli → <code>/seller/signin</code></p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-created-admin',
                'name' => 'Yeni Sipariş (Admin)',
                'subject' => 'Platformda Yeni Sipariş Verildi!',
                'body' => '<h1>Merhaba Admin,</h1>
<p>Platformda yeni bir sipariş verildi (Sipariş No: @order_id).</p>
<p>Sipariş Tutarı: @order_amount</p>
<p>Lütfen sipariş detaylarını inceleyip gerekli işlemi yapın.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-pending',
                'name' => 'Sipariş Beklemede Bildirimi',
                'subject' => 'Sipariş Durumu: Beklemede',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Siparişiniz (Sipariş No: @order_id) şu an <strong>beklemede</strong>.</p>
<p>Sipariş durumunuz değiştiğinde sizi bilgilendireceğiz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-confirmed',
                'name' => 'Sipariş Onaylandı Bildirimi',
                'subject' => 'Sipariş Durumu: Onaylandı',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Siparişiniz (Sipariş No: @order_id) <strong>onaylandı</strong>!</p>
<p>İşleme alındığında sizi bilgilendireceğiz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-processing',
                'name' => 'Sipariş İşleniyor Bildirimi',
                'subject' => 'Sipariş Durumu: İşleniyor',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Siparişiniz (Sipariş No: @order_id) şu an <strong>işleniyor</strong>.</p>
<p>Kargoya verildiğinde sizi bilgilendireceğiz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-shipped',
                'name' => 'Sipariş Kargoya Verildi Bildirimi',
                'subject' => 'Sipariş Durumu: Kargoya Verildi',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Siparişiniz (Sipariş No: @order_id) <strong>kargoya verildi</strong>!</p>
<p>Siparişiniz yolda ve en kısa sürede size ulaşacak.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-delivered',
                'name' => 'Sipariş Teslim Edildi Bildirimi',
                'subject' => 'Siparişiniz Teslim Edildi!',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Siparişiniz (Sipariş No: @order_id) <strong>teslim edildi</strong>!</p>
<p>Alışverişinizin keyfini çıkarmanızı dileriz!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-delivered-store',
                'name' => 'Sipariş Teslim Edildi (Mağaza)',
                'subject' => 'Sipariş Teslim Edildi - @store_name',
                'body' => '<h1>Merhaba,</h1>
<p><strong>@store_name</strong> mağazanızdan bir sipariş teslim edildi.</p>
<ul>
    <li>Sipariş No: @order_id</li>
    <li>Mağaza Tutarı: @order_amount_for_store</li>
</ul>
<p>Satıcı panelinizden sipariş detaylarını inceleyebilirsiniz.</p>
<p>👉 Satıcı Paneli → <code>/seller/signin</code></p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-delivered-admin',
                'name' => 'Sipariş Teslim Edildi (Admin)',
                'subject' => 'Sipariş Teslim Edildi - #@order_id',
                'body' => '<h1>Merhaba Admin,</h1>
<p>Sipariş No: @order_id başarıyla teslim edildi.</p>
<ul>
    <li>Admin Komisyonu: @order_amount_admin_commission</li>
    <li>Teslimat Komisyonu: @delivery_charge_commission_amount</li>
</ul>
<p>Admin panelinden detayları inceleyebilirsiniz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'order-status-cancelled',
                'name' => 'Sipariş İptal Bildirimi',
                'subject' => 'Siparişiniz İptal Edildi',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Siparişiniz (Sipariş No: @order_id) <strong>iptal edildi</strong>.</p>
<p>Sorularınız için destek ekibimizle iletişime geçebilirsiniz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'refund-customer',
                'name' => 'İade İşlendi',
                'subject' => 'İadeniz İşleme Alındı',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Sipariş No: @order_id için iadeniz başarıyla işleme alındı.</p>
<p>İade Tutarı: @refund_amount</p>
<p>Tutar en kısa sürede hesabınıza yansıtılacaktır.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'refund-store',
                'name' => 'Mağaza İade Bildirimi',
                'subject' => 'Mağazanızdaki Bir Sipariş İçin İade İşlendi',
                'body' => '<h1>Merhaba @store_owner_name,</h1>
<p>Mağazanızdaki bir sipariş için iade işlendi (Sipariş No: @order_id).</p>
<p>İade Tutarı: @refund_amount</p>
<p>Lütfen hesabınızın buna göre güncellendiğinden emin olun.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'wallet-balance-added-customer',
                'name' => 'Müşteri Cüzdan Bakiyesi Eklendi',
                'subject' => 'Cüzdan Bakiyeniz Güncellendi',
                'body' => '<h1>Merhaba @customer_name,</h1>
<p>Cüzdan bakiyeniz başarıyla güncellendi.</p>
<p>Yeni Bakiye: @balance</p>
<p>Hizmetimizi kullandığınız için teşekkür ederiz!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'wallet-balance-added-store',
                'name' => 'Mağaza Cüzdan Bakiyesi Eklendi',
                'subject' => 'Mağaza Cüzdan Bakiyeniz Güncellendi',
                'body' => '<h1>Merhaba @store_owner_name,</h1>
<p>Mağazanızın cüzdan bakiyesi başarıyla güncellendi.</p>
<p>Mağaza: @store_name</p>
<p>Yeni Bakiye: @balance</p>
<p>Platformumuzun bir parçası olduğunuz için teşekkür ederiz!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'store-withdrawal-request',
                'name' => 'Mağaza Çekim Talebi',
                'subject' => 'Yeni Çekim Talebi Gönderildi',
                'body' => '<h1>Merhaba Admin,</h1>
<p>@store_owner_name, <strong>@store_name</strong> mağazası için bir çekim talebi gönderdi.</p>
<p>Talep Edilen Tutar: @amount</p>
<p>Lütfen inceleyip gerekli işlemi yapın.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'store-withdrawal-approved',
                'name' => 'Mağaza Çekim Talebi Onaylandı',
                'subject' => 'Çekim Talebiniz Onaylandı',
                'body' => '<h1>Merhaba @store_owner_name,</h1>
<p><strong>@store_name</strong> mağazanız için çekim talebiniz onaylandı.</p>
<p>Tutar: @amount</p>
<p>Tutar en kısa sürede hesabınıza aktarılacaktır.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'store-withdrawal-declined',
                'name' => 'Mağaza Çekim Talebi Reddedildi',
                'subject' => 'Çekim Talebiniz Reddedildi',
                'body' => '<h1>Merhaba @store_owner_name,</h1>
<p><strong>@store_name</strong> mağazanız için çekim talebiniz reddedildi.</p>
<p>Tutar: @amount</p>
<p>Sorularınız için destek ekibimizle iletişime geçebilirsiniz.</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'deliveryman-withdrawal-request',
                'name' => 'Kurye Çekim Talebi',
                'subject' => 'Çekim Talebiniz Alındı',
                'body' => '<h1>Merhaba @deliveryman_name,</h1>
<p>@amount tutarındaki çekim talebiniz başarıyla gönderildi.</p>
<p>Talebiniz admin tarafından incelenmektedir. İşlem tamamlandığında bir onay e-postası alacaksınız.</p>
<p>Emekleriniz için teşekkür ederiz!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'type' => 'deliveryman-earning',
                'name' => 'Kurye Kazanç Bildirimi',
                'subject' => 'Yeni Kazancınız Var!',
                'body' => '<h1>Merhaba @deliveryman_name,</h1>
<p>Yeni bir kazanç elde ettiniz:</p>
<p><strong>Sipariş No:</strong> @order_id</p>
<p><strong>Sipariş Tutarı:</strong> @order_amount</p>
<p><strong>Kazancınız:</strong> @earnings_amount</p>
<p>Emekleriniz için teşekkür ederiz!</p>',
                'status' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        EmailTemplate::insert($templates);
        $this->command->info('EmailTemplateSeeder: Root templates (TR) seeded.');

        // ── English translations ──────────────────────────────────────────
        if (!Schema::hasTable('translations')) {
            $this->command->warn('EmailTemplateSeeder: translations table does not exist. Skipping translations...');
            return;
        }

        $enData = [
            'register' => [
                'name' => 'User Registration',
                'subject' => 'Welcome to Sportoonline!',
                'body' => '<h1>Welcome @name!</h1>
<p>Thank you for joining the Sportoonline family.</p>
<ul>
    <li>Name: @name</li>
    <li>Email: @email</li>
    <li>Phone: @phone</li>
</ul>',
            ],
            'seller-register' => [
                'name' => 'Seller Registration Confirmation',
                'subject' => '@site_name - Your Seller Account is Ready!',
                'body' => '<h1>Welcome @name!</h1>
<p>Your seller account on @site_name has been successfully created.</p>
<ul>
    <li>Name: @name</li>
    <li>Email: @email</li>
    <li>Phone: @phone</li>
</ul>
<h2>Next Steps</h2>
<p>Log in to the <strong>Seller Panel</strong> to create your store and manage your products:</p>
<p>👉 <strong>Login:</strong> Seller Panel → <code>/seller/signin</code></p>
<p>👉 <strong>Your email:</strong> @email</p>
<p>From your seller panel you can:</p>
<ul>
    <li>Create and customize your store</li>
    <li>Add your products</li>
    <li>Manage your orders</li>
    <li>Track your earnings</li>
</ul>
<p>Good luck!</p>',
            ],
            'seller-register-for-admin' => [
                'name' => 'New Seller Registration (Admin)',
                'subject' => 'New Seller Joined: @name',
                'body' => '<h1>Hello Admin, A New Seller Just Joined!</h1>
<ul>
    <li>Name: @name</li>
    <li>Email: @email</li>
    <li>Phone: @phone</li>
</ul>
<p>You can review the seller from the admin panel.</p>',
            ],
            'password-reset' => [
                'name' => 'Password Reset',
                'subject' => 'Sportoonline Password Reset Request',
                'body' => '<h1>Hello @name,</h1>
<p>We received a request to reset your password. Use this code:</p>
<h2>@reset_code</h2>
<p>If this wasn\'t you, please ignore this email.</p>',
            ],
            'store-creation' => [
                'name' => 'New Store Created',
                'subject' => 'Your New Store Has Been Created on Sportoonline',
                'body' => '<h1>Hello @owner_name,</h1>
<p>Your store <strong>@store_name</strong> has been successfully created!</p>',
            ],
            'subscription-expired' => [
                'name' => 'Subscription Expired Notification',
                'subject' => 'Your Subscription Has Expired!',
                'body' => '<h1>Hello @owner_name,</h1>
<p>Your subscription for the store <strong>@store_name</strong> has expired on @expiry_date.</p>
<p>Please renew your subscription to continue using our services.</p>',
            ],
            'subscription-renewed' => [
                'name' => 'Subscription Renewal Confirmation',
                'subject' => 'Your Subscription Has Been Successfully Renewed!',
                'body' => '<h1>Hello @owner_name,</h1>
<p>Your subscription for the store <strong>@store_name</strong> has been successfully renewed.</p>
<p>New Expiry Date: @new_expiry_date</p>
<p>Thank you for staying with us!</p>',
            ],
            'order-created' => [
                'name' => 'New Order Created',
                'subject' => 'Your Order Has Been Placed!',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your order (Order ID: @order_id) has been successfully placed.</p>
<p>Order Amount: @order_amount</p>
<p>We will notify you once your order status changes.</p>',
            ],
            'order-created-store' => [
                'name' => 'New Order for Your Store',
                'subject' => 'You Have a New Order in Your Store!',
                'body' => '<h1>Hello @store_owner_name,</h1>
<p>Your store <strong>@store_name</strong> has received a new order (Order ID: @order_id).</p>
<p>Order Amount: @order_amount</p>
<p>Please process the order as soon as possible.</p>
<p>👉 Seller Panel → <code>/seller/signin</code></p>',
            ],
            'order-created-admin' => [
                'name' => 'New Order (Admin)',
                'subject' => 'New Order Placed on the Platform!',
                'body' => '<h1>Hello Admin,</h1>
<p>A new order (Order ID: @order_id) has been placed on the platform.</p>
<p>Order Amount: @order_amount</p>
<p>Please review the order details and take necessary action.</p>',
            ],
            'order-status-pending' => [
                'name' => 'Order Pending Notification',
                'subject' => 'Order Status: Pending',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your order (Order ID: @order_id) is now <strong>pending</strong>.</p>
<p>We will notify you once the order status changes.</p>',
            ],
            'order-status-confirmed' => [
                'name' => 'Order Confirmed Notification',
                'subject' => 'Order Status: Confirmed',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your order (Order ID: @order_id) has been <strong>confirmed</strong>!</p>
<p>We will notify you once it is processed.</p>',
            ],
            'order-status-processing' => [
                'name' => 'Order Processing Notification',
                'subject' => 'Order Status: Processing',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your order (Order ID: @order_id) is now <strong>being processed</strong>.</p>
<p>We will notify you once it is shipped.</p>',
            ],
            'order-status-shipped' => [
                'name' => 'Order Shipped Notification',
                'subject' => 'Order Status: Shipped',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your order (Order ID: @order_id) has been <strong>shipped</strong>!</p>
<p>It is on its way to you and will arrive soon.</p>',
            ],
            'order-status-delivered' => [
                'name' => 'Order Delivered Notification',
                'subject' => 'Your Order Has Been Delivered!',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your order (Order ID: @order_id) has been <strong>delivered</strong>!</p>
<p>We hope you enjoy your purchase!</p>',
            ],
            'order-status-delivered-store' => [
                'name' => 'Order Delivered (Store)',
                'subject' => 'Order Delivered - @store_name',
                'body' => '<h1>Hello,</h1>
<p>An order from your store <strong>@store_name</strong> has been delivered.</p>
<ul>
    <li>Order ID: @order_id</li>
    <li>Store Amount: @order_amount_for_store</li>
</ul>
<p>You can review order details from your seller panel.</p>
<p>👉 Seller Panel → <code>/seller/signin</code></p>',
            ],
            'order-status-delivered-admin' => [
                'name' => 'Order Delivered (Admin)',
                'subject' => 'Order Delivered - #@order_id',
                'body' => '<h1>Hello Admin,</h1>
<p>Order #@order_id has been successfully delivered.</p>
<ul>
    <li>Admin Commission: @order_amount_admin_commission</li>
    <li>Delivery Commission: @delivery_charge_commission_amount</li>
</ul>
<p>Review details from the admin panel.</p>',
            ],
            'order-status-cancelled' => [
                'name' => 'Order Cancelled Notification',
                'subject' => 'Your Order Has Been Cancelled',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your order (Order ID: @order_id) has been <strong>cancelled</strong>.</p>
<p>If you have any questions, please contact our support team.</p>',
            ],
            'refund-customer' => [
                'name' => 'Refund Processed',
                'subject' => 'Your Refund Has Been Processed',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your refund for Order ID: @order_id has been successfully processed.</p>
<p>Refund Amount: @refund_amount</p>
<p>The amount will be credited back to your account shortly.</p>',
            ],
            'refund-store' => [
                'name' => 'Store Refund Notification',
                'subject' => 'A Refund Has Been Processed for an Order in Your Store',
                'body' => '<h1>Hello @store_owner_name,</h1>
<p>A refund has been processed for an order in your store (Order ID: @order_id).</p>
<p>Refund Amount: @refund_amount</p>
<p>Please ensure your account is updated accordingly.</p>',
            ],
            'wallet-balance-added-customer' => [
                'name' => 'Customer Wallet Balance Added',
                'subject' => 'Your Wallet Balance Has Been Updated',
                'body' => '<h1>Hello @customer_name,</h1>
<p>Your wallet balance has been successfully updated.</p>
<p>New Balance: @balance</p>
<p>Thank you for using our service!</p>',
            ],
            'wallet-balance-added-store' => [
                'name' => 'Store Wallet Balance Added',
                'subject' => 'Your Store Wallet Balance Has Been Updated',
                'body' => '<h1>Hello @store_owner_name,</h1>
<p>Your store\'s wallet balance has been successfully updated.</p>
<p>Store: @store_name</p>
<p>New Balance: @balance</p>
<p>Thank you for being a part of our platform!</p>',
            ],
            'store-withdrawal-request' => [
                'name' => 'Store Withdrawal Request',
                'subject' => 'A Withdrawal Request Has Been Submitted',
                'body' => '<h1>Hello Admin,</h1>
<p>A withdrawal request has been submitted by @store_owner_name for their store <strong>@store_name</strong>.</p>
<p>Requested Amount: @amount</p>
<p>Please review and take the necessary action.</p>',
            ],
            'store-withdrawal-approved' => [
                'name' => 'Store Withdrawal Approved',
                'subject' => 'Your Withdrawal Request Has Been Approved',
                'body' => '<h1>Hello @store_owner_name,</h1>
<p>Your withdrawal request for your store <strong>@store_name</strong> has been approved.</p>
<p>Amount: @amount</p>
<p>The amount will be transferred to your account shortly.</p>',
            ],
            'store-withdrawal-declined' => [
                'name' => 'Store Withdrawal Declined',
                'subject' => 'Your Withdrawal Request Has Been Declined',
                'body' => '<h1>Hello @store_owner_name,</h1>
<p>Your withdrawal request for your store <strong>@store_name</strong> has been declined.</p>
<p>Amount: @amount</p>
<p>If you have any questions, please contact the support team.</p>',
            ],
            'deliveryman-withdrawal-request' => [
                'name' => 'Deliveryman Withdrawal Request',
                'subject' => 'Your Withdrawal Request Has Been Received',
                'body' => '<h1>Hello @deliveryman_name,</h1>
<p>Your withdrawal request has been successfully submitted for the amount of @amount.</p>
<p>Your request is being reviewed by the admin. You will receive a confirmation email once your request has been processed.</p>
<p>Thank you for your hard work!</p>',
            ],
            'deliveryman-earning' => [
                'name' => 'Delivery Earnings Notification',
                'subject' => 'You Have New Earnings!',
                'body' => '<h1>Hello @deliveryman_name,</h1>
<p>You\'ve received a new earning:</p>
<p><strong>Order ID:</strong> @order_id</p>
<p><strong>Order Amount:</strong> @order_amount</p>
<p><strong>Earnings:</strong> @earnings_amount</p>
<p>Thank you for your hard work!</p>',
            ],
        ];

        $allTemplates = EmailTemplate::all();

        foreach ($allTemplates as $template) {
            $en = $enData[$template->type] ?? null;
            if (!$en) continue;

            foreach (['name', 'subject', 'body'] as $key) {
                Translation::updateOrCreate(
                    [
                        'translatable_type' => 'App\\Models\\EmailTemplate',
                        'translatable_id'   => $template->id,
                        'language'           => 'en',
                        'key'                => $key,
                    ],
                    [
                        'value' => $en[$key] ?? '',
                    ],
                );
            }
        }

        $this->command->info('EmailTemplateSeeder: EN translations seeded.');
    }
}
