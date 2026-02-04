<?php

namespace App\Repositories;

use App\Models\ProductAuthor;
use App\Interfaces\ProductAuthorInterface;
use App\Models\Translation;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;


/**
 *
 * @package namespace App\Repositories;
 */
class ProductAuthorRepository implements ProductAuthorInterface
{
    public function __construct(protected ProductAuthor $author, protected Translation $translation)
    {
    }

    public function translationKeys(): mixed
    {
        return $this->author->translationKeys;
    }

    public function model(): string
    {
        return ProductAuthor::class;
    }

    public function index(): mixed
    {
        return null;
    }

    public function getAllAuthor(int|string $limit, int $page, string $language, string $search, string $sortField, string $sort, array $filters)
    {
        $author = ProductAuthor::leftJoin('translations', function ($join) use ($language) {
            $join->on('product_authors.id', '=', 'translations.translatable_id')
                ->where('translations.translatable_type', '=', ProductAuthor::class)
                ->where('translations.language', '=', $language)
                ->where('translations.key', '=', 'name');
        })
            ->select(
                'product_authors.*',
                DB::raw('COALESCE(translations.value, product_authors.name) as name')
            );
        // Apply search filter if search parameter exists
        if ($search) {
            $author->where(function ($query) use ($search) {
                $query->where(DB::raw("CONCAT_WS(' ', product_authors.name, translations.value)"), 'like', "%{$search}%");
            });
        }
        // Apply sorting and pagination
        // Return the result
        return $author->with('related_translations')
            ->orderBy($sortField, $sort)
            ->paginate($limit);
    }

    public function getSellerAuthors(int|string $limit, int $page, string $language, string $search, string $sortField, string $sort, array $filters)
    {
        $author = ProductAuthor::leftJoin('translations', function ($join) use ($language) {
            $join->on('product_authors.id', '=', 'translations.translatable_id')
                ->where('translations.translatable_type', '=', ProductAuthor::class)
                ->where('translations.language', '=', $language)
                ->where('translations.key', '=', 'name');
        })
            ->select(
                'product_authors.*',
                DB::raw('COALESCE(translations.value, product_authors.name) as name')
            );


        // Apply search filter if search parameter exists
        if ($search) {
            $author->where(function ($query) use ($search) {
                $query->where(DB::raw("CONCAT_WS(' ', product_authors.name, translations.value)"), 'like', "%{$search}%");
            });
        }
        // Apply sorting and pagination
        // Return the result
        return $author
            ->where('created_by', auth('api')->id())
            ->orderBy($sortField, $sort)
            ->paginate($limit);
    }

    public function store(array $data)
    {
        try {
            $data = Arr::except($data, ['translations']);
            $author = ProductAuthor::create($data);
            return $author->id;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function update(array $data)
    {
        try {
            $author = ProductAuthor::findOrFail($data['id']);
            if ($author) {
                $data = Arr::except($data, ['translations']);
                $author->update($data);
                return $author->id;
            } else {
                return false;
            }
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function getAuthorById(int|string $id)
    {
        try {
            $author = ProductAuthor::with(['related_translations', 'creator'])->findOrFail($id);
            return $author;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function changeStatus(array $data): mixed
    {
        $author = ProductAuthor::findOrFail($data["id"]);
        $author->status = $data["status"];
        $author->save();
        return $author;
    }

    public function delete(int|string $id)
    {
        try {
            $author = ProductAuthor::findOrFail($id);
            $this->deleteTranslation($author->id, ProductAuthor::class);
            $author->delete();
            return true;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    private function deleteTranslation(int|string $id, string $translatable_type)
    {
        try {
            $translation = Translation::where('translatable_id', $id)
                ->where('translatable_type', $translatable_type)
                ->delete();
            return true;
        } catch (\Throwable $th) {
            throw $th;
        }
    }

    public function storeTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        $translations = [];
        if ($request['translations']) {
            foreach ($request['translations'] as $translation) {
                foreach ($colNames as $key) {

                    // Fallback value if translation key does not exist
                    $translatedValue = $translation[$key] ?? null;

                    // Skip translation if the value is NULL
                    if ($translatedValue === null) {
                        continue; // Skip this field if it's NULL
                    }
                    // Collect translation data
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
        if (count($translations)) {
            $this->translation->insert($translations);
        }
        return true;
    }

    public function updateTranslation(Request $request, int|string $refid, string $refPath, array $colNames): bool
    {
        $translations = [];
        if ($request['translations']) {
            foreach ($request['translations'] as $translation) {
                foreach ($colNames as $key) {

                    // Fallback value if translation key does not exist
                    $translatedValue = $translation[$key] ?? null;

                    // Skip translation if the value is NULL
                    if ($translatedValue === null) {
                        continue; // Skip this field if it's NULL
                    }

                    $trans = $this->translation->where('translatable_type', $refPath)->where('translatable_id', $refid)
                        ->where('language', $translation['language_code'])->where('key', $key)->first();
                    if ($trans != null) {
                        $trans->value = $translatedValue;
                        $trans->save();
                    } else {
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
        }
        if (count($translations)) {
            $this->translation->insert($translations);
        }
        return true;
    }

    public function approveAuthorRequest(array $ids)
    {
        if (!empty($ids)) {
            $authors = ProductAuthor::whereIn('id', $ids)
                ->where('status', 0)
                ->update(['status' => 1]);
            return $authors > 0; // if none of them is inactive
        } else {
            return false;
        }
    }

    public function authorRequests()
    {
        $authors = ProductAuthor::where('status', 0)->paginate(10);
        return $authors;
    }
}
