<?php

namespace App\Console\Commands;

use App\Models\SettingOption;
use App\Models\Translation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CloneTheme extends Command
{
    protected $signature = 'theme:clone
                            {source? : Kaynak tema slug. Bos birakilirsa aktif tema kullanilir}
                            {target=theme_two : Hedef tema slug}
                            {--name=Premium : Hedef tema gorunen adi}
                            {--description=Premium storefront theme : Hedef tema aciklamasi}';

    protected $description = 'Aktif veya secilen temayi hedef tema slotuna kopyalar';

    public function handle(): int
    {
        $sourceSlug = $this->argument('source') ?: (config('themes.active_theme') ?? config('themes.default_theme', 'theme_one'));
        $targetSlug = (string) $this->argument('target');
        $targetName = (string) $this->option('name');
        $targetDescription = (string) $this->option('description');

        $availableThemes = config('themes.available_themes', []);
        if (!in_array($sourceSlug, $availableThemes, true)) {
            $this->error("Kaynak tema gecersiz: {$sourceSlug}");
            return self::FAILURE;
        }

        if (!in_array($targetSlug, $availableThemes, true)) {
            $this->error("Hedef tema gecersiz: {$targetSlug}");
            return self::FAILURE;
        }

        if ($sourceSlug === $targetSlug) {
            $this->error('Kaynak ve hedef tema ayni olamaz.');
            return self::FAILURE;
        }

        $source = SettingOption::with('translations')
            ->where('option_name', $sourceSlug)
            ->first();

        if (!$source) {
            $this->error("Kaynak tema kaydi bulunamadi: {$sourceSlug}");
            return self::FAILURE;
        }

        DB::beginTransaction();

        try {
            $payload = json_decode((string) $source->option_value, true);
            if (!is_array($payload)) {
                $this->error('Kaynak tema verisi JSON olarak okunamadi.');
                DB::rollBack();
                return self::FAILURE;
            }

            $payload['slug'] = $targetSlug;
            $payload['name'] = $targetName;
            $payload['description'] = $targetDescription;

            $target = SettingOption::updateOrCreate(
                ['option_name' => $targetSlug],
                ['option_value' => json_encode($payload, JSON_UNESCAPED_UNICODE), 'autoload' => $source->autoload]
            );

            Translation::where('translatable_type', SettingOption::class)
                ->where('translatable_id', $target->id)
                ->delete();

            foreach ($source->translations as $translation) {
                $value = $translation->value;

                if ($translation->key === 'theme_data') {
                    $decoded = json_decode((string) $value, true);
                    if (is_array($decoded)) {
                        $decoded['slug'] = $targetSlug;
                        $decoded['name'] = $targetName;
                        $decoded['description'] = $targetDescription;
                        $value = json_encode($decoded, JSON_UNESCAPED_UNICODE);
                    }
                }

                Translation::create([
                    'translatable_type' => SettingOption::class,
                    'translatable_id' => $target->id,
                    'language' => $translation->language,
                    'key' => $translation->key,
                    'value' => $value,
                ]);
            }

            DB::commit();

            $this->info("Tema kopyalandi: {$sourceSlug} -> {$targetSlug}");
            $this->line("Hedef ad: {$targetName}");
            $this->line("Hedef aciklama: {$targetDescription}");
            $this->line('Bir sonraki adim: admin panelden Premium temayi ozellestirin.');
            $this->line('Not: aktif temayi degistirmeden theme_two/Premium uzerinde calisabilirsiniz.');

            return self::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error($e->getMessage());
            return self::FAILURE;
        }
    }
}
