<?php

namespace App\Repositories;

use App\Interfaces\AllNoticeManageInterface;
use App\Models\Store;
use App\Models\StoreNotice;
use App\Models\StoreNoticeRecipient;
use App\Models\Translation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AllNoticeManageRepository implements AllNoticeManageInterface
{
    public function __construct(protected StoreNotice $storeNotice, protected Translation $translation)
    {

    }

    public function translationKeys(): mixed
    {
        return $this->storeNotice->translationKeys;
    }

    public function createNotice(array $data)
    {
        DB::beginTransaction(); // Start a transaction
        try {
            $notice = StoreNotice::create($data);
            DB::commit();
            if ($notice && $data['type'] !== 'general') {
                $data['notice_id'] = $notice->id;
                $notice_recipient = StoreNoticeRecipient::create($data);
                DB::commit();
            }
            return $notice->id;
        } catch (\Exception $exception) {
            DB::rollBack();
            return false;
        }
    }

    public function getNotice(array $filters)
    {
        try {
            $query = StoreNotice::query();
            if (isset($filters['search'])) {
                $searchTerm = $filters['search'];
                // Adding the search condition for both title and message
                $query->where(function ($query) use ($searchTerm) {
                    $query->where('title', 'like', '%' . $searchTerm . '%')
                        ->orWhere('message', 'like', '%' . $searchTerm . '%');
                });
            }
            // Priority filter
            if (isset($filters['priority']) && !empty($filters['priority'])) {
                $query->where('priority', $filters['priority']);
            }

            // Status filter
            if (isset($filters['status']) && !empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            // Type filter
            if (isset($filters['type']) && !empty($filters['type'])) {
                $query->where('type', $filters['type']);
            }

            // Paginate the results
            $perPage = isset($filters['per_page']) ? $filters['per_page'] : 10; // Default to 15 if not provided
            return $query->latest()->paginate($perPage);
        } catch (\Exception $exception) {
            return false;
        }
    }

    public function getById($id)
    {
        try {
            $notice = StoreNotice::with(['recipients', 'related_translations'])->findOrFail($id);
            return $notice;
        } catch (\Exception $exception) {
            return false;
        }
    }

    public function updateNotice(array $data)
    {
        $general = $data['type'] == 'general';
        $seller = $data['type'] == 'specific_seller';
        $store = $data['type'] == 'specific_store';
        $notice = StoreNotice::find($data['id']);
        $notice_recipent = StoreNoticeRecipient::where('notice_id', $notice->id)->first();
        if ($notice_recipent){
            if ($general) {
                $notice_recipent->update([
                    'seller_id' => null,
                    'store_id' => null,
                ]);
            }
            else if ($seller) {
                $notice_recipent->update([
                    'seller_id' => $data['seller_id'],
                    'store_id' => null,
                ]);
            }
            else if ($store) {
                $notice_recipent->update([
                    'store_id' => $data['store_id'],
                    'seller_id' => null,
                ]);
            }
            else{
                $notice_recipent->update($data);
            }
        }

        $notice->update($data);
        return $notice->id;
    }

    public function toggleStatus($id)
    {
        try {
            $notice = StoreNotice::findOrFail($id);
            $notice->status = !$notice->status;
            $notice->save();
            return true;
        } catch (\Exception $exception) {
            return false;
        }

    }

    public function deleteNotice($id)
    {
        try {
            $notice = StoreNotice::findOrFail($id);
            $notice->delete();
            return true;
        } catch (\Exception $exception) {
            return false;
        }
    }

    public function getSellerStoreNotices()
    {
        $user = auth('api')->user();
        $userStores = Store::where('store_seller_id',$user->id)->pluck('id');
        $isStoreOwner = User::where('id', auth('api')->id())
            ->where('store_owner', 1)
            ->exists();

        if (!$userStores || !$isStoreOwner) {
            return [];
        }

        $query = StoreNoticeRecipient::with('notice')
            ->where(function ($query) use ($userStores) {
                $query->where(function ($subQuery) {
                    // Notices specific to the authenticated seller
                    $subQuery->where('seller_id', auth('api')->id())
                        ->whereHas('notice', function ($noticeQuery) {
                            $noticeQuery->where('status', 1); // Only active notices
                        });
                })
                    ->orWhere(function ($subQuery) use ($userStores) {
                        // Notices for the user's stores
                        $subQuery->whereNotNull('store_id')
                            ->whereIn('store_id', $userStores)
                            ->whereHas('notice', function ($noticeQuery) {
                                $noticeQuery->where('status', 1); // Only active notices
                            });
                    })
                    ->orWhereHas('notice', function ($noticeQuery) {
                        // General notices visible to everyone
                        $noticeQuery->where('type', 'general')
                            ->where('status', 1); // Only active notices
                    });
            });

        return $query->paginate(10);
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
}