<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $blogs = [
            // ============ FITNESS & ANTRENMAN ============
            [
                'tr' => [
                    'title' => 'Evde Yapabileceğiniz 10 Etkili Egzersiz',
                    'description' => '<p>Spor salonuna gitmeden de fit kalabilirsiniz! İşte evde kolayca yapabileceğiniz 10 etkili egzersiz.</p>
                    <h2>1. Squat (Çömelme)</h2>
                    <p>Bacak ve kalça kaslarını çalıştıran en etkili egzersizlerden biri. Ayaklarınızı omuz genişliğinde açın ve sandalyeye oturur gibi çömelin.</p>
                    <h2>2. Push-up (Şınav)</h2>
                    <p>Göğüs, omuz ve triceps kaslarını güçlendiren klasik egzersiz. Vücudunuzu düz tutarak aşağı inin ve yukarı itin.</p>
                    <h2>3. Plank</h2>
                    <p>Core kaslarını güçlendirmek için mükemmel. 30 saniye ile başlayın ve süreyi kademeli olarak artırın.</p>
                    <h2>4. Lunges (Hamle)</h2>
                    <p>Bacak kaslarını dengeli şekilde çalıştırır. Bir adım öne atın ve dizinizi 90 derece bükün.</p>
                    <h2>5. Burpee</h2>
                    <p>Tüm vücudu çalıştıran yüksek yoğunluklu egzersiz. Kalori yakmak için ideal!</p>',
                    'meta_title' => 'Evde Yapabileceğiniz 10 Etkili Egzersiz | Fitness Rehberi',
                    'meta_description' => 'Spor salonuna gitmeden evde yapabileceğiniz 10 etkili egzersiz. Squat, şınav, plank ve daha fazlası!',
                    'meta_keywords' => 'ev egzersizleri, evde spor, fitness, squat, şınav, plank',
                ],
                'en' => [
                    'title' => '10 Effective Exercises You Can Do at Home',
                    'description' => '<p>You can stay fit without going to the gym! Here are 10 effective exercises you can easily do at home.</p>
                    <h2>1. Squat</h2>
                    <p>One of the most effective exercises for leg and glute muscles. Open your feet shoulder-width apart and squat as if sitting in a chair.</p>
                    <h2>2. Push-up</h2>
                    <p>Classic exercise that strengthens chest, shoulder and triceps muscles. Keep your body straight, go down and push up.</p>
                    <h2>3. Plank</h2>
                    <p>Perfect for strengthening core muscles. Start with 30 seconds and gradually increase the time.</p>
                    <h2>4. Lunges</h2>
                    <p>Works leg muscles in a balanced way. Take a step forward and bend your knee at 90 degrees.</p>
                    <h2>5. Burpee</h2>
                    <p>High-intensity exercise that works the whole body. Ideal for burning calories!</p>',
                    'meta_title' => '10 Effective Exercises You Can Do at Home | Fitness Guide',
                    'meta_description' => '10 effective exercises you can do at home without going to the gym. Squats, push-ups, planks and more!',
                    'meta_keywords' => 'home exercises, home workout, fitness, squat, push-up, plank',
                ],
                'category_slug' => 'fitness-antrenman',
                'slug' => 'evde-yapabileceginiz-10-etkili-egzersiz',
                'image' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200',
                'tag_name' => 'fitness,ev egzersizi,antrenman',
                'views' => 1250,
            ],
            [
                'tr' => [
                    'title' => 'Kas Kütlesi Artırmak İçin 5 Altın Kural',
                    'description' => '<p>Kas kütlesi artırmak istiyorsanız bu 5 altın kuralı mutlaka uygulayın!</p>
                    <h2>1. Protein Alımınızı Artırın</h2>
                    <p>Günlük vücut ağırlığınızın kilogramı başına 1.6-2.2 gram protein tüketin. Tavuk, hindi, yumurta, balık ve protein tozu iyi kaynaklardır.</p>
                    <h2>2. Progressive Overload Uygulayın</h2>
                    <p>Her hafta ağırlıkları veya tekrar sayısını kademeli olarak artırın. Kaslarınız adaptasyon için sürekli zorlanmalı.</p>
                    <h2>3. Compound Hareketlere Odaklanın</h2>
                    <p>Squat, deadlift, bench press gibi birden fazla kas grubunu çalıştıran hareketler en etkili sonuçları verir.</p>
                    <h2>4. Yeterince Dinlenin</h2>
                    <p>Kaslar antrenmanda değil, dinlenme sürecinde büyür. Günde 7-9 saat uyku hedefleyin.</p>
                    <h2>5. Tutarlı Olun</h2>
                    <p>Sonuçlar zaman alır. En az 12 hafta tutarlı antrenman ve beslenme programı uygulayın.</p>',
                    'meta_title' => 'Kas Kütlesi Artırmak İçin 5 Altın Kural',
                    'meta_description' => 'Kas kütlesi artırmak için protein alımı, progressive overload ve dinlenme stratejileri. Uzman tavsiyeleri.',
                    'meta_keywords' => 'kas kütlesi, kas yapma, protein, antrenman, bodybuilding',
                ],
                'en' => [
                    'title' => '5 Golden Rules for Building Muscle Mass',
                    'description' => '<p>If you want to build muscle mass, make sure to follow these 5 golden rules!</p>
                    <h2>1. Increase Your Protein Intake</h2>
                    <p>Consume 1.6-2.2 grams of protein per kilogram of body weight daily. Chicken, turkey, eggs, fish and protein powder are good sources.</p>
                    <h2>2. Apply Progressive Overload</h2>
                    <p>Gradually increase weights or reps each week. Your muscles need to be constantly challenged for adaptation.</p>
                    <h2>3. Focus on Compound Movements</h2>
                    <p>Movements that work multiple muscle groups like squat, deadlift, bench press give the most effective results.</p>
                    <h2>4. Rest Enough</h2>
                    <p>Muscles grow during rest, not during training. Aim for 7-9 hours of sleep per day.</p>
                    <h2>5. Be Consistent</h2>
                    <p>Results take time. Follow a consistent training and nutrition program for at least 12 weeks.</p>',
                    'meta_title' => '5 Golden Rules for Building Muscle Mass',
                    'meta_description' => 'Protein intake, progressive overload and rest strategies for building muscle mass. Expert advice.',
                    'meta_keywords' => 'muscle mass, muscle building, protein, training, bodybuilding',
                ],
                'category_slug' => 'fitness-antrenman',
                'slug' => 'kas-kutlesi-artirmak-icin-5-altin-kural',
                'image' => 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200',
                'tag_name' => 'kas yapma,protein,bodybuilding',
                'views' => 2340,
            ],

            // ============ BESLENME & DİYET ============
            [
                'tr' => [
                    'title' => 'Sporcular İçin En İyi 10 Protein Kaynağı',
                    'description' => '<p>Kas gelişimi ve toparlanma için protein şart! İşte sporcular için en iyi 10 doğal protein kaynağı.</p>
                    <h2>1. Tavuk Göğsü</h2>
                    <p>100 gramında 31 gram protein içerir. Yağ oranı düşük, protein oranı yüksek mükemmel bir kaynak.</p>
                    <h2>2. Yumurta</h2>
                    <p>Biyolojik değeri en yüksek protein kaynaklarından biri. Bir yumurta 6-7 gram protein içerir.</p>
                    <h2>3. Somon</h2>
                    <p>Hem protein hem de omega-3 yağ asitleri açısından zengin. 100 gramında 25 gram protein.</p>
                    <h2>4. Yunan Yoğurdu</h2>
                    <p>Normal yoğurda göre 2 kat daha fazla protein içerir. Atıştırmalık olarak ideal.</p>
                    <h2>5. Kırmızı Et</h2>
                    <p>Demir, B12 vitamini ve yüksek kaliteli protein kaynağı. Haftada 2-3 kez tüketin.</p>',
                    'meta_title' => 'Sporcular İçin En İyi 10 Protein Kaynağı',
                    'meta_description' => 'Kas gelişimi için en iyi protein kaynakları: tavuk, yumurta, somon, yunan yoğurdu ve daha fazlası.',
                    'meta_keywords' => 'protein kaynakları, sporcu beslenmesi, tavuk protein, yumurta protein',
                ],
                'en' => [
                    'title' => 'Top 10 Protein Sources for Athletes',
                    'description' => '<p>Protein is essential for muscle development and recovery! Here are the top 10 natural protein sources for athletes.</p>
                    <h2>1. Chicken Breast</h2>
                    <p>Contains 31 grams of protein per 100 grams. An excellent source with low fat and high protein ratio.</p>
                    <h2>2. Eggs</h2>
                    <p>One of the protein sources with the highest biological value. One egg contains 6-7 grams of protein.</p>
                    <h2>3. Salmon</h2>
                    <p>Rich in both protein and omega-3 fatty acids. 25 grams of protein per 100 grams.</p>
                    <h2>4. Greek Yogurt</h2>
                    <p>Contains twice as much protein as regular yogurt. Ideal as a snack.</p>
                    <h2>5. Red Meat</h2>
                    <p>Source of iron, vitamin B12 and high-quality protein. Consume 2-3 times a week.</p>',
                    'meta_title' => 'Top 10 Protein Sources for Athletes',
                    'meta_description' => 'Best protein sources for muscle development: chicken, eggs, salmon, greek yogurt and more.',
                    'meta_keywords' => 'protein sources, sports nutrition, chicken protein, egg protein',
                ],
                'category_slug' => 'beslenme-diyet',
                'slug' => 'sporcular-icin-en-iyi-10-protein-kaynagi',
                'image' => 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=1200',
                'tag_name' => 'protein,beslenme,sporcu beslenmesi',
                'views' => 3120,
            ],
            [
                'tr' => [
                    'title' => 'Antrenman Öncesi ve Sonrası Ne Yemeli?',
                    'description' => '<p>Doğru zamanda doğru besinleri tüketmek performansınızı artırır ve toparlanmayı hızlandırır.</p>
                    <h2>Antrenman Öncesi (1-2 saat önce)</h2>
                    <p>Karbonhidrat ağırlıklı, orta protein, düşük yağlı bir öğün tüketin. Örnek: Yulaf ezmesi + muz + bal.</p>
                    <h2>Antrenman Öncesi (30 dakika önce)</h2>
                    <p>Hafif bir atıştırmalık tercih edin. Muz, hurma veya enerji barı iyi seçeneklerdir.</p>
                    <h2>Antrenman Sonrası (30 dakika içinde)</h2>
                    <p>Protein shake veya hızlı emilen protein kaynağı tüketin. Whey protein + muz ideal kombinasyondur.</p>
                    <h2>Antrenman Sonrası (1-2 saat içinde)</h2>
                    <p>Dengeli bir öğün yiyin: protein + kompleks karbonhidrat + sebze. Örnek: Tavuk + pirinç + brokoli.</p>',
                    'meta_title' => 'Antrenman Öncesi ve Sonrası Beslenme Rehberi',
                    'meta_description' => 'Antrenman öncesi ve sonrası ne yemeli? Performans artırıcı beslenme stratejileri.',
                    'meta_keywords' => 'antrenman beslenmesi, pre-workout, post-workout, sporcu beslenmesi',
                ],
                'en' => [
                    'title' => 'What to Eat Before and After Training?',
                    'description' => '<p>Consuming the right nutrients at the right time increases your performance and speeds up recovery.</p>
                    <h2>Pre-Workout (1-2 hours before)</h2>
                    <p>Eat a carbohydrate-heavy, moderate protein, low-fat meal. Example: Oatmeal + banana + honey.</p>
                    <h2>Pre-Workout (30 minutes before)</h2>
                    <p>Choose a light snack. Banana, dates or energy bar are good options.</p>
                    <h2>Post-Workout (within 30 minutes)</h2>
                    <p>Consume protein shake or fast-absorbing protein source. Whey protein + banana is the ideal combination.</p>
                    <h2>Post-Workout (within 1-2 hours)</h2>
                    <p>Eat a balanced meal: protein + complex carbohydrates + vegetables. Example: Chicken + rice + broccoli.</p>',
                    'meta_title' => 'Pre and Post Workout Nutrition Guide',
                    'meta_description' => 'What to eat before and after training? Performance-enhancing nutrition strategies.',
                    'meta_keywords' => 'workout nutrition, pre-workout, post-workout, sports nutrition',
                ],
                'category_slug' => 'beslenme-diyet',
                'slug' => 'antrenman-oncesi-ve-sonrasi-ne-yemeli',
                'image' => 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200',
                'tag_name' => 'beslenme,pre-workout,post-workout',
                'views' => 1890,
            ],

            // ============ KOŞU & MARATON ============
            [
                'tr' => [
                    'title' => 'İlk Maratonunuza Nasıl Hazırlanırsınız?',
                    'description' => '<p>42 km koşmak büyük bir hedef! İşte ilk maratonunuza hazırlanmak için adım adım rehber.</p>
                    <h2>16 Haftalık Antrenman Planı</h2>
                    <p>Maraton hazırlığı en az 16 hafta sürer. Bu sürede haftalık koşu mesafenizi kademeli olarak artırın.</p>
                    <h2>Uzun Koşular</h2>
                    <p>Hafta sonları uzun koşu yapın. 15 km ile başlayıp maratondan 2 hafta önce 32-35 km\'ye ulaşın.</p>
                    <h2>Tempo Koşuları</h2>
                    <p>Haftada bir tempo koşusu yapın. Maraton temponuzdan biraz daha hızlı, 20-30 dakika koşun.</p>
                    <h2>Dinlenme</h2>
                    <p>Haftada en az 2 gün tam dinlenme veya çapraz antrenman yapın. Sakatlıkları önlemek için şart!</p>
                    <h2>Yarış Günü Stratejisi</h2>
                    <p>İlk yarıyı yavaş başlayın. Negatif split hedefleyin - ikinci yarıyı daha hızlı koşun.</p>',
                    'meta_title' => 'İlk Maratonunuza Nasıl Hazırlanırsınız? | Koşu Rehberi',
                    'meta_description' => 'İlk maraton hazırlığı için 16 haftalık antrenman planı, uzun koşular ve yarış günü stratejileri.',
                    'meta_keywords' => 'maraton hazırlık, koşu antrenmanı, 42 km, ilk maraton',
                ],
                'en' => [
                    'title' => 'How to Prepare for Your First Marathon?',
                    'description' => '<p>Running 42 km is a big goal! Here is a step-by-step guide to prepare for your first marathon.</p>
                    <h2>16-Week Training Plan</h2>
                    <p>Marathon preparation takes at least 16 weeks. Gradually increase your weekly running distance during this period.</p>
                    <h2>Long Runs</h2>
                    <p>Do long runs on weekends. Start with 15 km and reach 32-35 km two weeks before the marathon.</p>
                    <h2>Tempo Runs</h2>
                    <p>Do a tempo run once a week. Run 20-30 minutes slightly faster than your marathon pace.</p>
                    <h2>Rest</h2>
                    <p>Take at least 2 days of complete rest or cross-training per week. Essential to prevent injuries!</p>
                    <h2>Race Day Strategy</h2>
                    <p>Start the first half slow. Aim for negative split - run the second half faster.</p>',
                    'meta_title' => 'How to Prepare for Your First Marathon? | Running Guide',
                    'meta_description' => '16-week training plan, long runs and race day strategies for first marathon preparation.',
                    'meta_keywords' => 'marathon preparation, running training, 42 km, first marathon',
                ],
                'category_slug' => 'kosu-maraton',
                'slug' => 'ilk-maratonunuza-nasil-hazirlanirsiniz',
                'image' => 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=1200',
                'tag_name' => 'maraton,koşu,antrenman planı',
                'views' => 4560,
            ],
            [
                'tr' => [
                    'title' => 'Doğru Koşu Ayakkabısı Nasıl Seçilir?',
                    'description' => '<p>Koşu ayakkabısı seçimi sakatlıkları önlemek ve performansı artırmak için kritik öneme sahiptir.</p>
                    <h2>Ayak Tipinizi Belirleyin</h2>
                    <p>Düz taban, normal kemer veya yüksek kemer? Islak ayak testi ile ayak tipinizi öğrenin.</p>
                    <h2>Pronasyon Analizi</h2>
                    <p>Overpronation, underpronation veya nötral? Eski ayakkabılarınızın aşınma paternine bakın.</p>
                    <h2>Koşu Yüzeyi</h2>
                    <p>Asfalt, parkur veya arazi? Her yüzey için farklı taban yapısı gerekir.</p>
                    <h2>Doğru Numara</h2>
                    <p>Koşu ayakkabısı normal ayakkabıdan yarım numara büyük olmalı. Akşam saatlerinde deneyin.</p>
                    <h2>Markalar ve Modeller</h2>
                    <p>Nike, Asics, Hoka, Brooks, Adidas - her markanın farklı karakteristikleri var. Deneyerek en uygun olanı bulun.</p>',
                    'meta_title' => 'Doğru Koşu Ayakkabısı Nasıl Seçilir?',
                    'meta_description' => 'Koşu ayakkabısı seçim rehberi: ayak tipi, pronasyon analizi, yüzey seçimi ve marka önerileri.',
                    'meta_keywords' => 'koşu ayakkabısı, ayakkabı seçimi, Nike, Asics, Hoka',
                ],
                'en' => [
                    'title' => 'How to Choose the Right Running Shoes?',
                    'description' => '<p>Choosing running shoes is critical to prevent injuries and increase performance.</p>
                    <h2>Determine Your Foot Type</h2>
                    <p>Flat foot, normal arch or high arch? Learn your foot type with the wet foot test.</p>
                    <h2>Pronation Analysis</h2>
                    <p>Overpronation, underpronation or neutral? Look at the wear pattern of your old shoes.</p>
                    <h2>Running Surface</h2>
                    <p>Asphalt, track or trail? Different sole structure is required for each surface.</p>
                    <h2>Right Size</h2>
                    <p>Running shoes should be half a size larger than regular shoes. Try them in the evening.</p>
                    <h2>Brands and Models</h2>
                    <p>Nike, Asics, Hoka, Brooks, Adidas - each brand has different characteristics. Find the most suitable one by trying.</p>',
                    'meta_title' => 'How to Choose the Right Running Shoes?',
                    'meta_description' => 'Running shoe selection guide: foot type, pronation analysis, surface selection and brand recommendations.',
                    'meta_keywords' => 'running shoes, shoe selection, Nike, Asics, Hoka',
                ],
                'category_slug' => 'kosu-maraton',
                'slug' => 'dogru-kosu-ayakkabisi-nasil-secilir',
                'image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
                'tag_name' => 'koşu ayakkabısı,Nike,Asics,Hoka',
                'views' => 2780,
            ],

            // ============ OUTDOOR & DOĞA SPORLARI ============
            [
                'tr' => [
                    'title' => 'Trekking İçin Ekipman Listesi: Başlangıç Rehberi',
                    'description' => '<p>Trekking yapmaya başlamak istiyorsunuz ama nereden başlayacağınızı bilmiyorsunuz? İşte ihtiyacınız olan temel ekipmanlar.</p>
                    <h2>Ayakkabı</h2>
                    <p>Su geçirmez, bilekleri destekleyen trekking botları şart. Salomon, Merrell, Lowa iyi markalar.</p>
                    <h2>Sırt Çantası</h2>
                    <p>Günlük trekking için 25-35 litre yeterli. Ergonomik sırt sistemi ve bel kayışı olmalı.</p>
                    <h2>Kıyafetler</h2>
                    <p>Katmanlı giyim prensibi: iç katman (terletmez), orta katman (ısı tutucu), dış katman (rüzgar/yağmur geçirmez).</p>
                    <h2>Trekking Batonları</h2>
                    <p>Dizleri korur, denge sağlar. İnişlerde özellikle faydalı.</p>
                    <h2>Navigasyon</h2>
                    <p>GPS cihazı veya offline harita uygulaması (AllTrails, Komoot). Pusula da yanınızda olsun.</p>',
                    'meta_title' => 'Trekking Ekipman Listesi | Başlangıç Rehberi',
                    'meta_description' => 'Trekking için gerekli ekipmanlar: ayakkabı, çanta, kıyafet, baton ve navigasyon araçları.',
                    'meta_keywords' => 'trekking ekipmanları, outdoor, doğa yürüyüşü, trekking botu',
                ],
                'en' => [
                    'title' => 'Equipment List for Trekking: Beginner Guide',
                    'description' => '<p>Want to start trekking but dont know where to start? Here is the basic equipment you need.</p>
                    <h2>Shoes</h2>
                    <p>Waterproof trekking boots that support ankles are essential. Salomon, Merrell, Lowa are good brands.</p>
                    <h2>Backpack</h2>
                    <p>25-35 liters is enough for daily trekking. Should have ergonomic back system and hip belt.</p>
                    <h2>Clothing</h2>
                    <p>Layering principle: base layer (moisture-wicking), mid layer (insulating), outer layer (wind/waterproof).</p>
                    <h2>Trekking Poles</h2>
                    <p>Protects knees, provides balance. Especially useful on descents.</p>
                    <h2>Navigation</h2>
                    <p>GPS device or offline map app (AllTrails, Komoot). Also have a compass with you.</p>',
                    'meta_title' => 'Trekking Equipment List | Beginner Guide',
                    'meta_description' => 'Equipment needed for trekking: shoes, bag, clothing, poles and navigation tools.',
                    'meta_keywords' => 'trekking equipment, outdoor, hiking, trekking boots',
                ],
                'category_slug' => 'outdoor-doga-sporlari',
                'slug' => 'trekking-icin-ekipman-listesi',
                'image' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200',
                'tag_name' => 'trekking,outdoor,ekipman',
                'views' => 1670,
            ],
            [
                'tr' => [
                    'title' => 'Kamp Çadırı Seçim Rehberi',
                    'description' => '<p>Doğru çadır seçimi konforlu bir kamp deneyimi için kritik öneme sahiptir.</p>
                    <h2>Kapasite</h2>
                    <p>2 kişilik çadır 2 kişi + ekipman için dar kalabilir. 1 kişi fazlası olan model tercih edin.</p>
                    <h2>Mevsim Sınıfı</h2>
                    <p>3 mevsim çadırlar yaz ve bahar için ideal. 4 mevsim çadırlar kış kampları için gerekli.</p>
                    <h2>Ağırlık</h2>
                    <p>Backpacking için 2 kg altı tercih edin. Araç kampı yapıyorsanız ağırlık daha az önemli.</p>
                    <h2>Su Geçirmezlik</h2>
                    <p>En az 3000mm su sütunu olan modeller tercih edin. Dikişler bantlı olmalı.</p>
                    <h2>Kurulum Kolaylığı</h2>
                    <p>Free-standing çadırlar her yere kurulabilir. Tek kişi kurulumu yapılabilen modeller pratik.</p>',
                    'meta_title' => 'Kamp Çadırı Seçim Rehberi',
                    'meta_description' => 'Kamp çadırı nasıl seçilir? Kapasite, mevsim sınıfı, ağırlık ve su geçirmezlik kriterleri.',
                    'meta_keywords' => 'kamp çadırı, çadır seçimi, outdoor, kamp ekipmanı',
                ],
                'en' => [
                    'title' => 'Camping Tent Selection Guide',
                    'description' => '<p>Choosing the right tent is critical for a comfortable camping experience.</p>
                    <h2>Capacity</h2>
                    <p>A 2-person tent may be tight for 2 people + equipment. Choose a model with 1 extra person capacity.</p>
                    <h2>Season Rating</h2>
                    <p>3-season tents are ideal for summer and spring. 4-season tents are needed for winter camping.</p>
                    <h2>Weight</h2>
                    <p>Prefer under 2 kg for backpacking. Weight is less important if you are car camping.</p>
                    <h2>Waterproofness</h2>
                    <p>Prefer models with at least 3000mm water column. Seams should be taped.</p>
                    <h2>Ease of Setup</h2>
                    <p>Free-standing tents can be set up anywhere. Models that can be set up by one person are practical.</p>',
                    'meta_title' => 'Camping Tent Selection Guide',
                    'meta_description' => 'How to choose a camping tent? Capacity, season rating, weight and waterproofness criteria.',
                    'meta_keywords' => 'camping tent, tent selection, outdoor, camping equipment',
                ],
                'category_slug' => 'outdoor-doga-sporlari',
                'slug' => 'kamp-cadiri-secim-rehberi',
                'image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
                'tag_name' => 'kamp,çadır,outdoor',
                'views' => 1340,
            ],

            // ============ BİSİKLET ============
            [
                'tr' => [
                    'title' => 'Yol Bisikleti mi Dağ Bisikleti mi?',
                    'description' => '<p>Bisiklet almak istiyorsunuz ama hangisini seçeceğinizi bilmiyorsunuz? Her iki tipin avantajlarını inceleyelim.</p>
                    <h2>Yol Bisikleti</h2>
                    <p>Asfalt ve düz yollarda yüksek hız. İnce lastikler, hafif çerçeve, drop gidon. Uzun mesafe ve yarış odaklı.</p>
                    <h2>Dağ Bisikleti</h2>
                    <p>Arazi ve patika için ideal. Kalın lastikler, süspansiyon, düz gidon. Teknik iniş ve tırmanışlar için.</p>
                    <h2>Hibrit/Şehir Bisikleti</h2>
                    <p>Her iki dünyanın karışımı. Hem asfalt hem hafif arazi için uygun. Günlük ulaşım için ideal.</p>
                    <h2>Gravel Bisiklet</h2>
                    <p>Yol bisikleti konforu + arazi kabiliyeti. Stabilize yollar ve uzun turlar için mükemmel.</p>
                    <h2>Bütçe Önerileri</h2>
                    <p>Başlangıç: 10.000-20.000 TL, Orta seviye: 20.000-50.000 TL, İleri seviye: 50.000+ TL</p>',
                    'meta_title' => 'Yol Bisikleti mi Dağ Bisikleti mi? | Bisiklet Seçim Rehberi',
                    'meta_description' => 'Yol bisikleti ve dağ bisikleti karşılaştırması. Hangi bisiklet size uygun?',
                    'meta_keywords' => 'yol bisikleti, dağ bisikleti, bisiklet seçimi, MTB',
                ],
                'en' => [
                    'title' => 'Road Bike or Mountain Bike?',
                    'description' => '<p>Want to buy a bike but dont know which one to choose? Lets examine the advantages of both types.</p>
                    <h2>Road Bike</h2>
                    <p>High speed on asphalt and flat roads. Thin tires, light frame, drop handlebars. Long distance and race oriented.</p>
                    <h2>Mountain Bike</h2>
                    <p>Ideal for terrain and trails. Thick tires, suspension, flat handlebars. For technical descents and climbs.</p>
                    <h2>Hybrid/City Bike</h2>
                    <p>Mix of both worlds. Suitable for both asphalt and light terrain. Ideal for daily commuting.</p>
                    <h2>Gravel Bike</h2>
                    <p>Road bike comfort + off-road capability. Perfect for gravel roads and long tours.</p>
                    <h2>Budget Recommendations</h2>
                    <p>Beginner: $300-600, Intermediate: $600-1500, Advanced: $1500+</p>',
                    'meta_title' => 'Road Bike or Mountain Bike? | Bike Selection Guide',
                    'meta_description' => 'Road bike and mountain bike comparison. Which bike is right for you?',
                    'meta_keywords' => 'road bike, mountain bike, bike selection, MTB',
                ],
                'category_slug' => 'bisiklet',
                'slug' => 'yol-bisikleti-mi-dag-bisikleti-mi',
                'image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1200',
                'tag_name' => 'bisiklet,yol bisikleti,dağ bisikleti',
                'views' => 2150,
            ],

            // ============ YOGA & PİLATES ============
            [
                'tr' => [
                    'title' => 'Yeni Başlayanlar İçin Yoga: 5 Temel Poz',
                    'description' => '<p>Yoga dünyasına adım atmak istiyorsanız bu 5 temel poz ile başlayın.</p>
                    <h2>1. Dağ Pozu (Tadasana)</h2>
                    <p>Tüm ayakta pozların temelidir. Düz durun, omuzları gevşetin, nefese odaklanın.</p>
                    <h2>2. Aşağı Bakan Köpek (Adho Mukha Svanasana)</h2>
                    <p>Tüm vücudu esnetir. Elleri ve ayakları yere basın, kalçayı yukarı kaldırın.</p>
                    <h2>3. Savaşçı I (Virabhadrasana I)</h2>
                    <p>Bacakları güçlendirir, dengeyi geliştirir. Bir bacak önde, diğeri arkada, kollar yukarıda.</p>
                    <h2>4. Ağaç Pozu (Vrksasana)</h2>
                    <p>Denge ve konsantrasyon geliştirir. Tek ayak üzerinde durun, diğer ayağı baldıra veya uyluğa yerleştirin.</p>
                    <h2>5. Çocuk Pozu (Balasana)</h2>
                    <p>Dinlenme pozu. Dizler üzerine oturun, alnınızı yere koyun, kolları öne uzatın.</p>',
                    'meta_title' => 'Yeni Başlayanlar İçin Yoga: 5 Temel Poz',
                    'meta_description' => 'Yoga başlangıç rehberi: Dağ pozu, aşağı bakan köpek, savaşçı ve ağaç pozu nasıl yapılır?',
                    'meta_keywords' => 'yoga başlangıç, yoga pozları, tadasana, yoga nedir',
                ],
                'en' => [
                    'title' => 'Yoga for Beginners: 5 Basic Poses',
                    'description' => '<p>If you want to step into the world of yoga, start with these 5 basic poses.</p>
                    <h2>1. Mountain Pose (Tadasana)</h2>
                    <p>Foundation of all standing poses. Stand straight, relax shoulders, focus on breath.</p>
                    <h2>2. Downward Facing Dog (Adho Mukha Svanasana)</h2>
                    <p>Stretches the whole body. Press hands and feet to ground, lift hips up.</p>
                    <h2>3. Warrior I (Virabhadrasana I)</h2>
                    <p>Strengthens legs, improves balance. One leg forward, other back, arms up.</p>
                    <h2>4. Tree Pose (Vrksasana)</h2>
                    <p>Develops balance and concentration. Stand on one foot, place other foot on calf or thigh.</p>
                    <h2>5. Child Pose (Balasana)</h2>
                    <p>Resting pose. Sit on knees, put forehead on ground, extend arms forward.</p>',
                    'meta_title' => 'Yoga for Beginners: 5 Basic Poses',
                    'meta_description' => 'Yoga beginner guide: How to do mountain pose, downward dog, warrior and tree pose?',
                    'meta_keywords' => 'yoga beginner, yoga poses, tadasana, what is yoga',
                ],
                'category_slug' => 'yoga-pilates',
                'slug' => 'yeni-baslayanlar-icin-yoga-5-temel-poz',
                'image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200',
                'tag_name' => 'yoga,başlangıç,pozlar',
                'views' => 3890,
            ],

            // ============ EKİPMAN & ÜRÜN İNCELEMELERİ ============
            [
                'tr' => [
                    'title' => '2024 En İyi Akıllı Saatler: Sporcular İçin Karşılaştırma',
                    'description' => '<p>Antrenmanlarınızı takip etmek için en iyi akıllı saatleri karşılaştırdık.</p>
                    <h2>Garmin Forerunner 965</h2>
                    <p>Ciddi koşucular için en iyi seçim. AMOLED ekran, 23 gün pil ömrü, gelişmiş antrenman metrikleri.</p>
                    <h2>Apple Watch Ultra 2</h2>
                    <p>iPhone kullanıcıları için ideal. Sağlam yapı, çift frekanslı GPS, 36 saat pil ömrü.</p>
                    <h2>Polar Vantage V3</h2>
                    <p>Bilimsel antrenman analizi için. Biosensing teknolojisi, uyku analizi, antrenman yükü takibi.</p>
                    <h2>Coros Pace 3</h2>
                    <p>Bütçe dostu performans. 38 gün pil ömrü, hafif tasarım, temel tüm özellikler.</p>
                    <h2>Suunto Race</h2>
                    <p>Outdoor sporları için. Offline haritalar, barometrik altimetre, dayanıklı yapı.</p>',
                    'meta_title' => '2024 En İyi Spor Akıllı Saatler Karşılaştırması',
                    'meta_description' => 'Garmin, Apple Watch, Polar, Coros ve Suunto karşılaştırması. Sporcular için en iyi akıllı saat hangisi?',
                    'meta_keywords' => 'akıllı saat, Garmin, Apple Watch, Polar, spor saati',
                ],
                'en' => [
                    'title' => '2024 Best Smart Watches: Comparison for Athletes',
                    'description' => '<p>We compared the best smart watches to track your training.</p>
                    <h2>Garmin Forerunner 965</h2>
                    <p>Best choice for serious runners. AMOLED display, 23-day battery life, advanced training metrics.</p>
                    <h2>Apple Watch Ultra 2</h2>
                    <p>Ideal for iPhone users. Robust build, dual-frequency GPS, 36-hour battery life.</p>
                    <h2>Polar Vantage V3</h2>
                    <p>For scientific training analysis. Biosensing technology, sleep analysis, training load tracking.</p>
                    <h2>Coros Pace 3</h2>
                    <p>Budget-friendly performance. 38-day battery life, lightweight design, all basic features.</p>
                    <h2>Suunto Race</h2>
                    <p>For outdoor sports. Offline maps, barometric altimeter, durable build.</p>',
                    'meta_title' => '2024 Best Sports Smart Watches Comparison',
                    'meta_description' => 'Garmin, Apple Watch, Polar, Coros and Suunto comparison. Which is the best smart watch for athletes?',
                    'meta_keywords' => 'smart watch, Garmin, Apple Watch, Polar, sports watch',
                ],
                'category_slug' => 'ekipman-urun-incelemeleri',
                'slug' => '2024-en-iyi-akilli-saatler-karsilastirma',
                'image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1200',
                'tag_name' => 'akıllı saat,Garmin,Apple Watch,Polar',
                'views' => 5670,
            ],
            [
                'tr' => [
                    'title' => 'Whey Protein Markaları Karşılaştırması',
                    'description' => '<p>Piyasadaki en popüler whey protein markalarını test ettik ve karşılaştırdık.</p>
                    <h2>Optimum Nutrition Gold Standard</h2>
                    <p>Endüstri standardı. Kepçe başına 24g protein, düşük yağ ve karbonhidrat. Lezzet çeşitliliği mükemmel.</p>
                    <h2>MyProtein Impact Whey</h2>
                    <p>Fiyat/performans şampiyonu. Kepçe başına 21g protein. İngiltere üretimi, AB kalite standartları.</p>
                    <h2>Dymatize ISO100</h2>
                    <p>Hidrolize izolat. En hızlı emilim, laktoz intoleransı olanlar için ideal. Kepçe başına 25g protein.</p>
                    <h2>Hardline Whey 3Matrix</h2>
                    <p>Yerli üretim kalite. Konsantre, izolat ve hidrolize karışımı. Uygun fiyat.</p>
                    <h2>BSN Syntha-6</h2>
                    <p>Yavaş salınımlı formül. Yatmadan önce veya öğün arası için ideal. Kremsi doku.</p>',
                    'meta_title' => 'Whey Protein Markaları Karşılaştırması 2024',
                    'meta_description' => 'ON Gold Standard, MyProtein, Dymatize, Hardline protein karşılaştırması. En iyi whey protein hangisi?',
                    'meta_keywords' => 'whey protein, protein tozu, Optimum Nutrition, MyProtein',
                ],
                'en' => [
                    'title' => 'Whey Protein Brands Comparison',
                    'description' => '<p>We tested and compared the most popular whey protein brands on the market.</p>
                    <h2>Optimum Nutrition Gold Standard</h2>
                    <p>Industry standard. 24g protein per scoop, low fat and carbs. Excellent flavor variety.</p>
                    <h2>MyProtein Impact Whey</h2>
                    <p>Price/performance champion. 21g protein per scoop. UK made, EU quality standards.</p>
                    <h2>Dymatize ISO100</h2>
                    <p>Hydrolyzed isolate. Fastest absorption, ideal for lactose intolerant. 25g protein per scoop.</p>
                    <h2>Hardline Whey 3Matrix</h2>
                    <p>Local production quality. Concentrate, isolate and hydrolyzed blend. Affordable price.</p>
                    <h2>BSN Syntha-6</h2>
                    <p>Slow-release formula. Ideal before bed or between meals. Creamy texture.</p>',
                    'meta_title' => 'Whey Protein Brands Comparison 2024',
                    'meta_description' => 'ON Gold Standard, MyProtein, Dymatize, Hardline protein comparison. Which is the best whey protein?',
                    'meta_keywords' => 'whey protein, protein powder, Optimum Nutrition, MyProtein',
                ],
                'category_slug' => 'ekipman-urun-incelemeleri',
                'slug' => 'whey-protein-markalari-karsilastirmasi',
                'image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=1200',
                'tag_name' => 'protein,supplement,whey protein',
                'views' => 4230,
            ],

            // ============ MOTİVASYON & BAŞARI HİKAYELERİ ============
            [
                'tr' => [
                    'title' => '100 Kilo Veren Adam: Ahmet\'in Hikayesi',
                    'description' => '<p>Ahmet, 180 kilodan 80 kiloya düşerek hayatını değiştirdi. İşte ilham verici hikayesi.</p>
                    <h2>Başlangıç</h2>
                    <p>"180 kiloydum ve merdiven çıkmakta bile zorlanıyordum. Bir gün oğlumla futbol oynayamadığımı fark ettim ve karar verdim."</p>
                    <h2>İlk Adımlar</h2>
                    <p>"Diyetisyene gittim, spor salonuna yazıldım. İlk ay sadece yürüdüm. Yavaş yavaş tempo artırdım."</p>
                    <h2>Zorluklar</h2>
                    <p>"3. ayda motivasyonum düştü. Ama topluluk desteği çok önemliydi. Spor arkadaşlarım beni motive etti."</p>
                    <h2>Sonuç</h2>
                    <p>"2 yılda 100 kilo verdim. Şimdi yarı maraton koşuyorum. Hayatım tamamen değişti."</p>
                    <h2>Tavsiyeler</h2>
                    <p>"Küçük hedefler koyun. Her başarıyı kutlayın. Topluluk bulun. Ve asla pes etmeyin!"</p>',
                    'meta_title' => '100 Kilo Veren Adam: Ahmet\'in İlham Verici Hikayesi',
                    'meta_description' => '180 kilodan 80 kiloya! Ahmet\'in kilo verme yolculuğu ve başarı sırları.',
                    'meta_keywords' => 'kilo verme, başarı hikayesi, motivasyon, zayıflama',
                ],
                'en' => [
                    'title' => 'Man Who Lost 100 Kilos: Ahmet\'s Story',
                    'description' => '<p>Ahmet changed his life by going from 180 kilos to 80 kilos. Here is his inspiring story.</p>
                    <h2>Beginning</h2>
                    <p>"I was 180 kilos and even had difficulty climbing stairs. One day I realized I couldn\'t play football with my son and I decided."</p>
                    <h2>First Steps</h2>
                    <p>"I went to a dietitian, signed up for the gym. First month I just walked. Gradually increased the pace."</p>
                    <h2>Challenges</h2>
                    <p>"My motivation dropped in the 3rd month. But community support was very important. My gym friends motivated me."</p>
                    <h2>Result</h2>
                    <p>"I lost 100 kilos in 2 years. Now I run half marathons. My life has completely changed."</p>
                    <h2>Advice</h2>
                    <p>"Set small goals. Celebrate every success. Find community. And never give up!"</p>',
                    'meta_title' => 'Man Who Lost 100 Kilos: Ahmet\'s Inspiring Story',
                    'meta_description' => 'From 180 kilos to 80 kilos! Ahmet\'s weight loss journey and secrets of success.',
                    'meta_keywords' => 'weight loss, success story, motivation, losing weight',
                ],
                'category_slug' => 'motivasyon-basari-hikayeleri',
                'slug' => '100-kilo-veren-adam-ahmetin-hikayesi',
                'image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200',
                'tag_name' => 'motivasyon,kilo verme,başarı hikayesi',
                'views' => 8920,
            ],

            // ============ SAĞLIK & SAKATLIKLAR ============
            [
                'tr' => [
                    'title' => 'Koşucu Dizi: Nedenleri ve Tedavisi',
                    'description' => '<p>Koşucu dizi (Patellofemoral ağrı sendromu), koşucularda en sık görülen sakatlıklardan biridir.</p>
                    <h2>Belirtiler</h2>
                    <p>Diz kapağının altında veya etrafında ağrı. Merdiven inişinde, uzun süre oturmada veya koşu sırasında artar.</p>
                    <h2>Nedenleri</h2>
                    <p>Aşırı yüklenme, zayıf kuadriseps kasları, yanlış ayakkabı seçimi, ani antrenman artışı.</p>
                    <h2>Tedavi</h2>
                    <p>İlk aşamada RICE protokolü (Dinlenme, Buz, Kompresyon, Elevasyon). Ardından fizik tedavi ve güçlendirme egzersizleri.</p>
                    <h2>Önleme</h2>
                    <p>Kuadriseps ve kalça kaslarını güçlendirin. Antrenman yükünü kademeli artırın. Doğru ayakkabı kullanın.</p>
                    <h2>Ne Zaman Doktora Gitmeli?</h2>
                    <p>Ağrı 2 haftadan uzun sürerse, şişlik varsa veya hareket kısıtlılığı oluşursa mutlaka doktora başvurun.</p>',
                    'meta_title' => 'Koşucu Dizi: Nedenleri, Belirtileri ve Tedavisi',
                    'meta_description' => 'Koşucu dizi nedir? Patellofemoral ağrı sendromu belirtileri, tedavisi ve önleme yöntemleri.',
                    'meta_keywords' => 'koşucu dizi, diz ağrısı, koşu sakatlığı, patellofemoral',
                ],
                'en' => [
                    'title' => 'Runner\'s Knee: Causes and Treatment',
                    'description' => '<p>Runner\'s knee (Patellofemoral pain syndrome) is one of the most common injuries in runners.</p>
                    <h2>Symptoms</h2>
                    <p>Pain below or around the kneecap. Increases when descending stairs, sitting for long periods or running.</p>
                    <h2>Causes</h2>
                    <p>Overload, weak quadriceps muscles, wrong shoe choice, sudden training increase.</p>
                    <h2>Treatment</h2>
                    <p>RICE protocol first (Rest, Ice, Compression, Elevation). Then physical therapy and strengthening exercises.</p>
                    <h2>Prevention</h2>
                    <p>Strengthen quadriceps and hip muscles. Gradually increase training load. Use correct shoes.</p>
                    <h2>When to See a Doctor?</h2>
                    <p>If pain lasts more than 2 weeks, if there is swelling or range of motion limitation, definitely see a doctor.</p>',
                    'meta_title' => 'Runner\'s Knee: Causes, Symptoms and Treatment',
                    'meta_description' => 'What is runner\'s knee? Patellofemoral pain syndrome symptoms, treatment and prevention methods.',
                    'meta_keywords' => 'runner\'s knee, knee pain, running injury, patellofemoral',
                ],
                'category_slug' => 'saglik-sakatliklar',
                'slug' => 'kosucu-dizi-nedenleri-ve-tedavisi',
                'image' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200',
                'tag_name' => 'sakatlık,diz ağrısı,koşu,rehabilitasyon',
                'views' => 2340,
            ],

            // ============ YÜZME & SU SPORLARI ============
            [
                'tr' => [
                    'title' => 'Serbest Stil Yüzme Tekniği: Adım Adım Rehber',
                    'description' => '<p>Serbest stil (krol) en hızlı ve en yaygın kullanılan yüzme tekniğidir. Doğru teknikle daha hızlı ve verimli yüzebilirsiniz.</p>
                    <h2>Vücut Pozisyonu</h2>
                    <p>Vücudunuz su yüzeyine paralel olmalı. Kalçalar batmamalı. Başınız nötr pozisyonda, sadece nefes alırken yana dönün.</p>
                    <h2>Kol Hareketi</h2>
                    <p>Dirsek yukarıda, el suya parmak uçlarıyla girer. Suyu kavrayın ve kalçanıza doğru itin. S hareketi değil, düz çekin.</p>
                    <h2>Ayak Vuruşu</h2>
                    <p>Kalçadan başlayan flutter kick. Dizler hafif bükük, ayak bilekleri gevşek. 6 vuruş/kol döngüsü standart.</p>
                    <h2>Nefes Alma</h2>
                    <p>Bilateral nefes (her 3 kulaçta bir) dengeyi korur. Yüzünüz yana dönerken, ağzınızı sudaki boşluktan nefes alın.</p>
                    <h2>Sık Yapılan Hatalar</h2>
                    <p>Başı çok yukarı tutmak, dizden tekme atmak, çok geniş kulaç açmak, nefes alırken durmak.</p>',
                    'meta_title' => 'Serbest Stil Yüzme Tekniği: Adım Adım Rehber',
                    'meta_description' => 'Krol tekniği nasıl yapılır? Vücut pozisyonu, kol hareketi, ayak vuruşu ve nefes alma teknikleri.',
                    'meta_keywords' => 'serbest stil, krol, yüzme tekniği, yüzme öğren',
                ],
                'en' => [
                    'title' => 'Freestyle Swimming Technique: Step by Step Guide',
                    'description' => '<p>Freestyle (front crawl) is the fastest and most commonly used swimming technique. With proper technique you can swim faster and more efficiently.</p>
                    <h2>Body Position</h2>
                    <p>Your body should be parallel to the water surface. Hips should not sink. Head in neutral position, only turn sideways when breathing.</p>
                    <h2>Arm Movement</h2>
                    <p>Elbow up, hand enters water with fingertips. Grab the water and push towards your hip. Pull straight, not S motion.</p>
                    <h2>Kick</h2>
                    <p>Flutter kick starting from hips. Knees slightly bent, ankles relaxed. 6 kicks/arm cycle is standard.</p>
                    <h2>Breathing</h2>
                    <p>Bilateral breathing (every 3 strokes) maintains balance. As your face turns sideways, breathe from the pocket in the water.</p>
                    <h2>Common Mistakes</h2>
                    <p>Keeping head too high, kicking from knee, opening arms too wide, stopping when breathing.</p>',
                    'meta_title' => 'Freestyle Swimming Technique: Step by Step Guide',
                    'meta_description' => 'How to do crawl technique? Body position, arm movement, kicking and breathing techniques.',
                    'meta_keywords' => 'freestyle, front crawl, swimming technique, learn swimming',
                ],
                'category_slug' => 'yuzme-su-sporlari',
                'slug' => 'serbest-stil-yuzme-teknigi-adim-adim-rehber',
                'image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
                'meta_image' => 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200',
                'tag_name' => 'yüzme,serbest stil,teknik,eğitim',
                'views' => 1890,
            ],
        ];

        DB::transaction(function () use ($blogs) {
            // Mevcut blog ve translationları temizle
            DB::table('translations')
                ->where('translatable_type', 'Modules\\Blog\\app\\Models\\Blog')
                ->delete();
            DB::table('blogs')->delete();

            // Kategori slug -> id eşleştirmesi
            $categories = DB::table('blog_categories')
                ->pluck('id', 'slug')
                ->toArray();

            foreach ($blogs as $index => $blog) {
                $categoryId = $categories[$blog['category_slug']] ?? null;

                if (!$categoryId) {
                    echo "Warning: Category not found for slug: {$blog['category_slug']}\n";
                    continue;
                }

                $blogId = DB::table('blogs')->insertGetId([
                    'admin_id' => 1,
                    'category_id' => $categoryId,
                    'title' => $blog['tr']['title'],
                    'slug' => $blog['slug'],
                    'description' => $blog['tr']['description'],
                    'image' => $blog['image'],
                    'views' => $blog['views'],
                    'visibility' => 'public',
                    'status' => 1,
                    'schedule_date' => now()->subDays(rand(1, 60)),
                    'tag_name' => $blog['tag_name'],
                    'meta_title' => $blog['tr']['meta_title'],
                    'meta_description' => $blog['tr']['meta_description'],
                    'meta_keywords' => $blog['tr']['meta_keywords'],
                    'meta_image' => $blog['meta_image'],
                    'created_at' => now()->subDays(rand(1, 90)),
                    'updated_at' => now(),
                ]);

                // TR, EN ve DF translations
                foreach (['df', 'tr', 'en'] as $lang) {
                    $source = $lang === 'df' ? 'tr' : $lang;
                    $this->insertTranslation($blogId, $lang, 'title', $blog[$source]['title']);
                    $this->insertTranslation($blogId, $lang, 'description', $blog[$source]['description']);
                    $this->insertTranslation($blogId, $lang, 'meta_title', $blog[$source]['meta_title']);
                    $this->insertTranslation($blogId, $lang, 'meta_description', $blog[$source]['meta_description']);
                    $this->insertTranslation($blogId, $lang, 'meta_keywords', $blog[$source]['meta_keywords']);
                }
            }
        });

        echo "Blogs seeded successfully! Total: " . count($blogs) . "\n";
    }

    private function insertTranslation(int $blogId, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $blogId,
            'translatable_type' => 'Modules\\Blog\\app\\Models\\Blog',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
