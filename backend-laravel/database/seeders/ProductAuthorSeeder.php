<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductAuthorSeeder extends Seeder
{
    public function run(): void
    {
        $authors = [
            [
                'tr' => [
                    'name' => 'Bear Grylls',
                    'bio' => '<p>Bear Grylls, İngiliz maceraperest, yazar ve televizyon sunucusudur. Eski SAS askeri olan Grylls, 23 yaşında Everest\'e tırmanan en genç İngiliz olmuştur. "Man vs. Wild" programıyla dünya çapında tanınmış, hayatta kalma teknikleri üzerine çok sayıda kitap yazmıştır. Doğada hayatta kalma konusunda dünyanın en tanınmış isimlerinden biridir.</p>'
                ],
                'en' => [
                    'name' => 'Bear Grylls',
                    'bio' => '<p>Bear Grylls is a British adventurer, writer and television presenter. A former SAS serviceman, Grylls became the youngest Briton to climb Everest at age 23. He gained worldwide fame through "Man vs. Wild" and has written numerous books on survival techniques. He is one of the world\'s most recognized figures in wilderness survival.</p>'
                ],
                'born_date' => '1974-06-07',
                'death_date' => null,
            ],
            [
                'tr' => [
                    'name' => 'Dean Karnazes',
                    'bio' => '<p>Dean Karnazes, Amerikalı ultra maraton koşucusu ve yazardır. "Ultramarathon Man" kitabıyla tanınan Karnazes, 50 eyalette 50 günde 50 maraton koşma gibi inanılmaz başarılara imza atmıştır. TIME dergisi tarafından dünyanın en fit 100 kişisinden biri seçilmiştir. Dayanıklılık sporları ve motivasyon konusunda ilham verici eserleriyle bilinir.</p>'
                ],
                'en' => [
                    'name' => 'Dean Karnazes',
                    'bio' => '<p>Dean Karnazes is an American ultramarathon runner and author. Known for his book "Ultramarathon Man", Karnazes has accomplished incredible feats such as running 50 marathons in 50 states in 50 days. He was named one of TIME magazine\'s 100 most influential people in health and fitness. He is known for his inspirational works on endurance sports and motivation.</p>'
                ],
                'born_date' => '1962-08-23',
                'death_date' => null,
            ],
            [
                'tr' => [
                    'name' => 'Christopher McDougall',
                    'bio' => '<p>Christopher McDougall, Amerikalı gazeteci ve yazardır. En çok "Born to Run" (Koşmak İçin Doğduk) adlı bestseller kitabıyla tanınır. Bu kitapta Meksika\'nın Bakır Kanyonu\'ndaki Tarahumara yerlilerinin koşu kültürünü ve yalın ayak koşunun evrimsel kökenlerini araştırmıştır. Koşu dünyasında devrim yaratan eserleriyle bilinir.</p>'
                ],
                'en' => [
                    'name' => 'Christopher McDougall',
                    'bio' => '<p>Christopher McDougall is an American journalist and author. He is best known for his bestselling book "Born to Run", in which he explored the running culture of the Tarahumara people in Mexico\'s Copper Canyon and the evolutionary origins of barefoot running. He is known for his revolutionary works in the running world.</p>'
                ],
                'born_date' => '1962-01-12',
                'death_date' => null,
            ],
            [
                'tr' => [
                    'name' => 'Jon Krakauer',
                    'bio' => '<p>Jon Krakauer, Amerikalı yazar ve dağcıdır. "Into the Wild" (Vahşi Doğaya) ve "Into Thin Air" (İnce Havaya Doğru) gibi bestseller kitaplarıyla tanınır. 1996 Everest faciasını bizzat yaşamış ve bu deneyimini kitaplaştırmıştır. Macera, dağcılık ve doğa üzerine yazdığı non-fiction eserleriyle dünya çapında milyonlarca okuyucuya ulaşmıştır.</p>'
                ],
                'en' => [
                    'name' => 'Jon Krakauer',
                    'bio' => '<p>Jon Krakauer is an American author and mountaineer. He is known for bestselling books such as "Into the Wild" and "Into Thin Air". He personally experienced the 1996 Everest disaster and documented it in his writing. His non-fiction works on adventure, mountaineering and nature have reached millions of readers worldwide.</p>'
                ],
                'born_date' => '1954-04-12',
                'death_date' => null,
            ],
            [
                'tr' => [
                    'name' => 'Reinhold Messner',
                    'bio' => '<p>Reinhold Messner, İtalyan dağcı, kaşif ve yazardır. Everest\'e oksijen tüpü kullanmadan tırmanan ilk kişi ve dünyanın 8000 metre üzerindeki 14 zirvesinin tamamına tırmanan ilk dağcıdır. 80\'den fazla kitap yazmış olan Messner, dağcılık tarihinin yaşayan efsanesidir. Macera ve keşif konusundaki eserleri klasikleşmiştir.</p>'
                ],
                'en' => [
                    'name' => 'Reinhold Messner',
                    'bio' => '<p>Reinhold Messner is an Italian mountaineer, explorer and author. He was the first person to climb Everest without supplemental oxygen and the first to climb all 14 peaks above 8000 meters. Having written over 80 books, Messner is a living legend in mountaineering history. His works on adventure and exploration have become classics.</p>'
                ],
                'born_date' => '1944-09-17',
                'death_date' => null,
            ],
            [
                'tr' => [
                    'name' => 'Alex Honnold',
                    'bio' => '<p>Alex Honnold, Amerikalı profesyonel kaya tırmanıcısı ve yazardır. İpsiz (free solo) tırmanış konusunda dünyanın en ünlü ismidir. 2017\'de El Capitan\'ı ipsiz tırmanarak tarihe geçmiştir. Bu başarısı "Free Solo" belgeseliyle Oscar ödülü kazanmıştır. "Alone on the Wall" kitabıyla tırmanış deneyimlerini paylaşmaktadır.</p>'
                ],
                'en' => [
                    'name' => 'Alex Honnold',
                    'bio' => '<p>Alex Honnold is an American professional rock climber and author. He is the world\'s most famous figure in free solo climbing. In 2017, he made history by free soloing El Capitan. This achievement won an Oscar through the "Free Solo" documentary. He shares his climbing experiences in his book "Alone on the Wall".</p>'
                ],
                'born_date' => '1985-08-17',
                'death_date' => null,
            ],
        ];

        DB::transaction(function () use ($authors) {
            // Clean existing data
            DB::table('translations')
                ->where('translatable_type', 'App\\Models\\ProductAuthor')
                ->delete();
            DB::table('product_authors')->delete();

            foreach ($authors as $author) {
                $slug = Str::slug($author['tr']['name']);

                $authorId = DB::table('product_authors')->insertGetId([
                    'name' => $author['tr']['name'],
                    'slug' => $slug,
                    'bio' => null, // Bio is stored in translations table
                    'born_date' => $author['born_date'],
                    'death_date' => $author['death_date'],
                    'status' => 1,
                    'created_by' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Translations
                $this->addTranslation($authorId, 'df', 'name', $author['tr']['name']);
                $this->addTranslation($authorId, 'df', 'bio', $author['tr']['bio']);
                $this->addTranslation($authorId, 'tr', 'name', $author['tr']['name']);
                $this->addTranslation($authorId, 'tr', 'bio', $author['tr']['bio']);
                $this->addTranslation($authorId, 'en', 'name', $author['en']['name']);
                $this->addTranslation($authorId, 'en', 'bio', $author['en']['bio']);
            }

            echo "Authors seeded: " . count($authors) . "\n";
        });

        echo "Product Authors seeded successfully!\n";
    }

    private function addTranslation(int $id, string $lang, string $key, string $value): void
    {
        DB::table('translations')->insert([
            'translatable_id' => $id,
            'translatable_type' => 'App\\Models\\ProductAuthor',
            'language' => $lang,
            'key' => $key,
            'value' => $value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
