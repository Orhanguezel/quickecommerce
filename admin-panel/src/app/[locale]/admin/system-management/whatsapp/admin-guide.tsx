const templates = [{"name": "sportoonline_payment_confirmed_v1", "text": "Merhaba {{1}}, {{2}} numaralı siparişiniz için {{3}} tutarındaki ödemeniz alındı. Sipariş durumunu hesabınızdan takip edebilirsiniz."}, {"name": "sportoonline_cod_order_received_v1", "text": "Merhaba {{1}}, {{2}} numaralı kapıda ödemeli siparişiniz alındı. Ödenecek tutar: {{3}}."}, {"name": "sportoonline_shipment_dispatched_v1", "text": "{{1}} numaralı siparişinizin {{2}} paketi {{3}} kargosuna verildi. Takip numarası: {{4}}."}, {"name": "sportoonline_shipment_delivered_v1", "text": "{{1}} numaralı siparişinizin {{2}} paketi teslim edildi olarak bildirildi. Destek için bize ulaşabilirsiniz."}, {"name": "sportoonline_order_cancelled_v1", "text": "{{1}} numaralı siparişinizin {{2}} bölümü iptal edildi. İade durumu varsa ayrıca bilgilendirileceksiniz."}, {"name": "sportoonline_refund_confirmed_v1", "text": "{{1}} numaralı siparişiniz için {{2}} tutarındaki iade ödeme sağlayıcısı tarafından işlendi. Hesabınıza yansıma süresi bankanıza bağlıdır."}];

export default function WhatsappAdminGuide() {
  return <section className="space-y-3 rounded border bg-white p-4 text-gray-900" aria-labelledby="whatsapp-guide-title">
    <h2 id="whatsapp-guide-title" className="text-lg font-semibold">Yönetici kullanım rehberi</h2>
    <p className="text-sm">İlk kurulumda aşağıdaki sırayı izleyin. Numara satın alma ve Meta hesabı/şablon onayları Meta tarafında; hesabı bağlama, kontrol ve bildirim ayarları Yönetim sekmesinde tamamlanır.</p>
    <details open className="rounded border p-3">
      <summary className="cursor-pointer font-medium">1. Başlamadan önce hazırlayın</summary>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
        <li>Sportoonline için ayrı bir telefon numarası alın. Numaranın SMS veya arama ile doğrulanmasına erişiminiz olsun.</li>
        <li>Meta işletme portföyü, WhatsApp işletme hesabı (WABA) ve WhatsApp Cloud API kullanan uygulamayı hazırlayın. Meta’nın istediği numara kaydı, doğrulama ve varsa hesap/ödeme adımlarını tamamlayın.</li>
        <li>Bu modül yalnız Sportoonline numarasını içeren ayrı WABA kabul eder. OSGB hesabının numarasını, anahtarlarını veya webhook ayarlarını burada kullanmayın.</li>
        <li>Telefon uygulamasında WhatsApp Business hesabının bulunması tek başına Cloud API bağlantısının hazır olduğu anlamına gelmez. Numara bağlantısı Meta tarafında tamamlanmalıdır.</li>
        <li>Kurulumu yapacak yönetici, mesajları takip edecek destek sorumlusu ve test mesajı almaya izin veren pilot alıcıyı belirleyin.</li>
      </ul>
    </details>
    <details className="rounded border p-3">
      <summary className="cursor-pointer font-medium">2. Hesap bilgilerini bulun ve bağlayın</summary>
      <dl className="mt-3 space-y-3 text-sm">
        <div><dt className="font-semibold">WhatsApp işletme hesabı ID</dt><dd>Sportoonline WABA kimliği. Meta uygulamanızın WhatsApp API kurulum bilgileri veya WhatsApp hesap bilgilerinde bulunur. İşletme portföyü ID’si ile karıştırmayın.</dd></div>
        <div><dt className="font-semibold">Telefon numarası ID</dt><dd>Meta’nın bu gönderici numarasına verdiği sayısal kimliktir. Buraya +90 ile başlayan telefonun kendisini yazmayın.</dd></div>
        <div><dt className="font-semibold">Erişim anahtarı</dt><dd>Bu uygulama ve WhatsApp hesabına erişebilen token. Üretim için uygun sistem kullanıcısı erişimini ve WhatsApp mesajlaşma/yönetim izinlerini teknik sorumlunuzla hazırlayın; örnek kurulumdaki geçici tokenı kalıcı kurulum olarak bırakmayın.</dd></div>
        <div><dt className="font-semibold">Uygulama gizli anahtarı</dt><dd>Aynı Meta uygulamasının App Secret değeridir. Telefon doğrulama kodu, WhatsApp PIN’i veya erişim tokenı değildir.</dd></div>
      </dl>
      <p className="mt-3 text-sm">Bu dört bilgiyi <strong>Yönetim</strong> sekmesindeki <strong>Hesabı bağla</strong> formuna girip <strong>Doğrula ve bağla</strong> düğmesine basın. Anahtarları yalnız bu forma girin; sohbet, e-posta veya ekran görüntüsüyle paylaşmayın. Panel sırları şifreli saklar ve geri göstermez.</p>
      <p className="mt-3 text-sm">Bağlantı kaydının oluşması gönderimi açmaz. Yanlış hesap veya numara aidiyeti varsa bilgileri düzeltin. Yeniden bağlama gönderimi kapatır; webhook, pilot numaralar ve bildirim ayarlarını tekrar kontrol etmeniz gerekir.</p>
    </details>
    <details className="rounded border p-3">
      <summary className="cursor-pointer font-medium">3. Bağlantıyı ve webhook’u doğrulayın</summary>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
        <li><strong>Bağlantıyı kontrol et</strong> düğmesine basın. Numaranın bağlı ve mesajlaşma durumunun AVAILABLE olmasını bekleyin. Bağlı görünmüyorsa Meta numara kaydını ve erişim yetkilerini kontrol ettirin.</li>
        <li><strong>Webhook bağlantısını kur</strong> düğmesine basın. Webhook, gelen mesajları ve gönderilerin teslim durumunu bu panele getirir. Kurulum özetinde bağlantının kurulduğunu görün.</li>
        <li>Pilot aşamasında hem gelen mesajı hem teslim durumunu kontrol edin. Panelde bağlantı kurulmuş görünmesi tek başına gerçek mesajın teslim edildiğini kanıtlamaz.</li>
      </ol>
      <p className="mt-3 text-sm">Sorun varsa ekrandaki bildirim adresini teknik sorumluya iletin. OSGB’nin mevcut webhook adresini değiştirerek çözmeye çalışmayın.</p>
    </details>
    <details className="rounded border p-3">
      <summary className="cursor-pointer font-medium">4. Bildirim şablonlarını hazırlayın</summary>
      <p className="mt-3 text-sm">Aşağıdaki taslakları Meta WhatsApp şablon yönetiminde oluşturun. İsimler birebir aynı, dil Türkçe (tr), kategori UTILITY olmalıdır. Numaralı alanları ve sıralarını koruyun; görsel başlık veya dinamik düğme eklemeyin. Meta onayı otomatik değildir.</p>
      <div className="mt-3 space-y-3">{templates.map(t=><article key={t.name} className="rounded bg-gray-50 p-3 text-sm"><h3 className="break-all font-mono font-semibold">{t.name}</h3><p className="mt-2 whitespace-pre-wrap break-words select-text">{t.text}</p></article>)}</div>
      <p className="mt-3 text-sm">Meta onayından sonra <strong>Şablonları eşitle</strong> düğmesine basın. Açacağınız her bildirim için APPROVED / UTILITY / tr görünmeli. Bekleyen veya reddedilen şablonu Meta’da düzeltip yeniden eşitleyin. Bu paneldeki eşitleme düğmesi Meta’ya yeni şablon başvurusu yapmaz.</p>
    </details>
    <details className="rounded border p-3">
      <summary className="cursor-pointer font-medium">5. Önce pilot gönderim yapın</summary>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
        <li>Bağlantı ve bildirimler bölümünde <strong>Yalnız pilot numaralara gönder</strong> seçili kalsın. İzinli alıcı numarasını ülke koduyla yazın; birden fazla numarayı virgülle ayırın.</li>
        <li>Onaylı şablonu bulunan bildirim türlerini seçin. <strong>Bildirimleri etkinleştir</strong> seçeneğini açıp <strong>Bildirim ayarlarını kaydet</strong> düğmesine basın. Bağlantı, webhook ve şablon kontrolleri geçmeden etkinleştirme yapılmaz.</li>
        <li>Pilot gönderim bölümünde olayı ve aynı pilot numarayı seçin. Şablon alanlarını yukarıdaki metindeki sırayla doldurun. Ödeme onayında alanlar: müşteri adı, sipariş numarası, tutar.</li>
        <li><strong>Önizle</strong> ile şablonun ve pilot alıcının uygunluğunu kontrol edin; önizleme mesaj göndermez.</li>
        <li>Test gönderimi onay kutusunu işaretleyip <strong>Test mesajı gönder</strong> düğmesine bir kez basın. Alıcıdan mesajı gördüğünü teyit edin ve Mesajlar bölümünde Teslim edildi veya Okundu durumunu kontrol edin.</li>
        <li>Pilot alıcıdan bu işletme numarasına yanıt yazmasını isteyin; gelen mesajı ve panelden yanıtlamayı doğrulayın.</li>
      </ol>
      <p className="mt-3 rounded bg-amber-50 p-2 text-sm text-amber-950">Ayarları her kaydedişte pilot numaraları yeniden girin. Güvenlik nedeniyle kayıtlı tam numaralar forma geri doldurulmaz.</p>
    </details>
    <details className="rounded border p-3">
      <summary className="cursor-pointer font-medium">6. Müşterilere açın ve günlük takip yapın</summary>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
        <li>Pilot teslim ve gelen mesaj testi tamamlanınca pilot modunu kapatın, açılacak olayları seçip ayarları kaydedin. İlk gün Mesajlar bölümündeki başarısız ve belirsiz sonuçları takip edin.</li>
        <li>Müşterinin WhatsApp izni gerekir. Sipariş ekranındaki izin o sipariş içindir; hesap tercihi ayrıca yönetilir. Adresin teslimat telefonu otomatik olarak WhatsApp izinli alıcı sayılmaz.</li>
        <li>Eski siparişler geriye dönük toplu gönderilmez. Manuel “ödendi/iade edildi” değişimi veya yalnız kargo etiketi oluşturmak doğrulanmış ödeme, iade ya da sevk bildirimi yerine geçmez.</li>
        <li>Gelen konuşmayı açarak yanıt verin. Serbest metin/dosya yanıtı müşterinin son mesajından sonraki 24 saat içinde kullanılabilir. Dosyalar JPEG, PNG veya PDF; en fazla 5 MB olabilir.</li>
        <li><strong>Okundu bilgisi gönder</strong> alıcıya okundu bilgisi iletir. Mesai dışı yanıtı kullanacaksanız metni ve Türkiye saatine göre başlangıç/bitişi kaydedin; aynı alıcıya günde bir otomatik yanıt verilir.</li>
        <li>DUR/STOP gibi iptal mesajı gönderen müşteriye otomatik gönderim durur. Gönderim izni olmadan müşteriyi yeniden test listesine eklemeyin.</li>
      </ul>
    </details>
    <details className="rounded border p-3">
      <summary className="cursor-pointer font-medium">7. Hata durumları ve gönderimi durdurma</summary>
      <dl className="mt-3 space-y-3 text-sm">
        <div><dt className="font-semibold">Ayarlar yüklenemiyor / yetki hatası</dt><dd>WhatsApp yönetim izni olan sistem yöneticisi hesabıyla giriş yapın. Yetkiniz yoksa teknik sorumludan erişim isteyin.</dd></div>
        <div><dt className="font-semibold">Hesap bağlanmıyor</dt><dd>WABA ve Phone Number ID eşleşmesini, token yetkisini/süresini, App Secret’ın aynı uygulamaya ait olmasını kontrol edin. Bu kurulumda ortak WABA kabul edilmez.</dd></div>
        <div><dt className="font-semibold">Etkinleştirme başarısız</dt><dd>Bağlantıyı yeniden kontrol edin, webhook’u kurun ve şablonları eşitleyin. En az bir bildirim türü seçin. Pilot açıksa pilot numarayı doldurun.</dd></div>
        <div><dt className="font-semibold">Meta kabul etti / Gönderildi</dt><dd>Henüz teslim onayı değildir. Teslim edildi durumunu ve pilot alıcının gözlemini bekleyin.</dd></div>
        <div><dt className="font-semibold">Sonuç belirsiz</dt><dd>Aynı mesajı yeniden oluşturarak tekrar göndermeyin. Teknik sorumlu sağlayıcı ve webhook kayıtlarını incelemelidir; aksi halde çift mesaj gidebilir.</dd></div>
        <div><dt className="font-semibold">Başarısız / Gönderilmedi</dt><dd>İzin, pilot listesi, hesap sağlığı ve şablon durumunu kontrol edin. Yeniden deneme yalnız sistemin güvenli bulduğu kesin geçici hatalarda kullanılabilir.</dd></div>
      </dl>
      <p className="mt-3 text-sm"><strong>Gönderimi durdurmak için:</strong> Bildirimleri etkinleştir seçeneğini kapatıp ayarları kaydedin. Bu işlem sağlayıcıya önceden iletilmiş mesajları geri almaz. Panele erişemiyorsanız teknik sorumludan kanalı durdurmasını isteyin.</p>
      <p className="mt-3 text-sm">Destek talebine işlem saatini, yapılan adımı ve sır içermeyen hata bilgisini ekleyin. Token, App Secret ve doğrulama kodlarını eklemeyin.</p>
    </details>
    <p className="text-xs text-gray-600">Rehber: 8 Kasım 2026 · Meta ekran adları değişebilir. Resmî kaynaklar: <a className="underline" href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer">Meta uygulamaları</a>, <a className="underline" href="https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api" target="_blank" rel="noreferrer">Meta Cloud API rehberi</a>. Bu rehberdeki panel adımları mevcut Sportoonline uygulamasına göredir.</p>
  </section>;
}
