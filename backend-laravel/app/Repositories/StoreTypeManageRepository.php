<?php

namespace App\Repositories;

use App\Interfaces\StoreTypeManageInterface;
use App\Models\StoreType;
use App\Models\StoreAreaSetting;
use App\Models\Translation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreTypeManageRepository implements StoreTypeManageInterface
{
    public function __construct(protected StoreType $storeType, protected Translation $translation)
    {

    }

    public function translationKeys(): mixed
    {
        return $this->storeType->translationKeys;
    }

    public function getAllStoreTypes(array $filters)
    {
        $query = StoreType::with('related_translations');
        if (isset($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'LIKE', $searchTerm)
                    ->orWhere('description', 'LIKE', $searchTerm)
                    ->orWhereHas('related_translations', function ($q) use ($searchTerm) {
                        $q->whereIn('key', ['name', 'description'])
                            ->where('value', 'LIKE', $searchTerm);
                    });
            });
        }
        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        $perPage = $filters['per_page'] ?? 10;
        $store_types = $query->paginate($perPage);
        if (!empty($store_types)) {
            return $store_types;
        } else {
            return null;
        }
    }

    public function createStoreType(array $data)
    {
        if (empty($data)) {
            return false;
        }
        $storeType = new StoreType();
        // 'type' is guarded so we assign it directly before saving
        $storeType->type = Str::slug($data['name'], '_');
        $storeType->fill([
            'name'                             => $data['name'],
            'description'                      => $data['description'] ?? null,
            'status'                           => $data['status'] ?? 1,
            'image'                            => $data['image'] ?? null,
            'additional_charge_enable_disable' => $data['additional_charge_enable_disable'] ?? 0,
            'additional_charge_name'           => $data['additional_charge_name'] ?? null,
            'additional_charge_amount'         => $data['additional_charge_amount'] ?? 0,
            'additional_charge_type'           => $data['additional_charge_type'] ?? 'fixed',
            'additional_charge_commission'     => $data['additional_charge_commission'] ?? 0,
        ]);
        $storeType->save();
        return $storeType->id;
    }

    public function updateStoreType(array $data)
    {
        if (empty($data)) {
            return false;
        }
        $storeType = StoreType::find($data['id']);
        if (!$storeType) {
            return null;
        }
        $storeType->update([
            'name' => $data['name'],
            'description' => $data['description'],
            'status' => $data['status'] ?? $storeType->status,
            'image' => $data['image'] ?? $storeType->image,
            'additional_charge_enable_disable' => $data['additional_charge_enable_disable'] ?? $storeType->additional_charge_enable_disable,
            'additional_charge_name' => $data['additional_charge_name'] ?? $storeType->additional_charge_name,
            'additional_charge_amount' => $data['additional_charge_amount'] ?? $storeType->additional_charge_amount,
            'additional_charge_type' => $data['additional_charge_type'] ?? $storeType->additional_charge_type,
            'additional_charge_commission' => $data['additional_charge_commission'] ?? $storeType->additional_charge_commission,
        ]);
        return $storeType->id;
    }

    public function getStoreTypeById(int $id)
    {
        $storeType = StoreType::with('related_translations')->find($id);
        if (!$storeType) {
            return null;
        }
        return $storeType;
    }

    public function createOrUpdateTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        if (empty($request['translations'])) {
            return false;  // Return false if no translations are provided
        }

        $translations = [];
        foreach ($request['translations'] as $translation) {
            foreach ($colNames as $key) {
                // Fallback value if translation key does not exist
                $translatedValue = $translation[$key] ?? null;

                // Skip translation if the value is NULL
                if ($translatedValue === null) {
                    continue; // Skip this field if it's NULL
                }

                // Check if a translation exists for the given reference path, ID, language, and key
                $trans = $this->translation
                    ->where('translatable_type', $refPath)
                    ->where('translatable_id', $refid)
                    ->where('language', $translation['language_code'])
                    ->where('key', $key)
                    ->first();

                if ($trans) {
                    // Update the existing translation
                    $trans->value = $translatedValue;
                    $trans->save();
                } else {
                    // Prepare new translation entry for insertion
                    $translations[] = [
                        'translatable_type' => $refPath,
                        'translatable_id' => $refid,
                        'language' => $translation['language_code'],
                        'key' => $key,
                        'value' => $translatedValue,
                    ];
                }
            }
        }

        // Insert new translations if any
        if (!empty($translations)) {
            $this->translation->insert($translations);
        }

        return true;
    }

    public function toogleStatus(int $id)
    {
        $storeType = StoreType::find($id);
        if (!$storeType) {
            return false;
        }
        return $storeType->update([
            'status' => !$storeType->status
        ]);
    }

}
