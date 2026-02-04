<?php

namespace App\Http\Controllers\Api\V1\Product;

use App\Helpers\MultilangSlug;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\ProductAuthorRequest;
use App\Http\Resources\Admin\AdminAuthorDetailsResource;
use App\Http\Resources\Admin\AdminAuthorRequestResource;
use App\Http\Resources\Admin\AdminAuthorResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Seller\SellerAuthorDetailsResource;
use App\Http\Resources\Seller\SellerAuthorResource;
use App\Interfaces\ProductAuthorInterface;
use App\Models\ProductAuthor;
use App\Models\User;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductAuthorController extends Controller
{
    public function __construct(
        protected ProductAuthorInterface $authorRepo,
    )
    {
    }

    public function listAuthors(Request $request)
    {
        $authors = $this->authorRepo->getAllAuthor(
            $request->limit ?? 10,
            $request->page ?? 1,
            $request->language ?? DEFAULT_LANGUAGE,
            $request->search ?? "",
            $request->sortField ?? 'id',
            $request->sort ?? 'asc',
            []
        );
        return response()->json([
            'data' => AdminAuthorResource::collection($authors),
            'meta' => new PaginationResource($authors)
        ]);
    }

    public function sellerAuthors(Request $request)
    {
        $authors = $this->authorRepo->getSellerAuthors(
            $request->limit ?? 10,
            $request->page ?? 1,
            $request->language ?? DEFAULT_LANGUAGE,
            $request->search ?? "",
            $request->sortField ?? 'id',
            $request->sort ?? 'asc',
            []
        );
        return response()->json([
            'data' => SellerAuthorResource::collection($authors),
            'meta' => new PaginationResource($authors),
        ]);
    }

    public function createAuthor(ProductAuthorRequest $request): JsonResponse
    {
        $slug = MultilangSlug::makeSlug(ProductAuthor::class, $request->name, 'slug');
        $request['slug'] = $slug;
        $request['created_by'] = auth('api')->id();
        $author = $this->authorRepo->store($request->all());
        createOrUpdateTranslation($request, $author, 'App\Models\ProductAuthor', $this->authorRepo->translationKeys());
        if ($author) {
            return $this->success(translate('messages.save_success', ['name' => 'Author']));
        } else {
            return $this->failed(translate('messages.save_failed', ['name' => 'Author']));
        }
    }

    public function authorAddRequest(ProductAuthorRequest $request): JsonResponse
    {
        $slug = MultilangSlug::makeSlug(ProductAuthor::class, $request->name, 'slug');
        $request['slug'] = $slug;
        $request['created_by'] = auth('api')->id();
        $author = $this->authorRepo->store($request->all());
        createOrUpdateTranslation($request, $author, 'App\Models\ProductAuthor', $this->authorRepo->translationKeys());
        if ($author) {
            return $this->success(translate('messages.request_success', ['name' => 'Author']));
        } else {
            return $this->failed(translate('messages.request_success', ['name' => 'Author']));
        }
    }

    public function getAuthorById(Request $request)
    {
        $author = $this->authorRepo->getAuthorById($request->id);
        if (User::query()->where('id', $author->created_by)->where('store_owner', 1)->exists()) {
            return response()->json(new SellerAuthorDetailsResource($author));
        } else {
            return response()->json(new AdminAuthorDetailsResource($author));
        }
    }

    public function updateAuthor(ProductAuthorRequest $request)
    {
        $data = $request->all();
        $author = ProductAuthor::find($data['id']);
        if (!$author) {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }
        $author = $this->authorRepo->update($data);
        createOrUpdateTranslation($request, $author, 'App\Models\ProductAuthor', $this->authorRepo->translationKeys());
        if ($author) {
            return $this->success(translate('messages.update_success', ['name' => 'Author']));
        } else {
            return $this->failed(translate('messages.update_failed', ['name' => 'Author']));
        }
    }

    public function changeAuthorStatus(Request $request): JsonResponse
    {
        try {
            $this->authorRepo->changeStatus($request->all());
            return $this->success(translate('messages.status_change_success'));
        } catch (\Exception $e) {
            return $this->failed(translate('messages.update_failed', ['name' => 'Author']));
        }
    }

    public function approveAuthors(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids*' => 'required|array',
        ]);
        if ($validator->fails()) {
            return $this->failed($validator->errors());
        }
        $success = $this->authorRepo->approveAuthorRequest($request->ids);
        if ($success) {
            return $this->success(__('messages.approve.success', ['name' => 'Authors']));
        } else {
            return $this->failed(__('messages.approve.failed', ['name' => 'Authors']));
        }
    }

    public function listAuthorRequest()
    {
        $authors = $this->authorRepo->authorRequests();
        return response()->json([
            'data' => AdminAuthorRequestResource::collection($authors),
            'meta' => new PaginationResource($authors)
        ]);
    }

    public function deleteAuthors(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'nullable|exists:product_authors,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $authors = ProductAuthor::whereIn('id', $request->ids)->get();

        $mediaIds = [];

        foreach ($authors as $author) {
            if ($author->profile_image) {
                $mediaIds[] = $author->profile_image;
            }
            if ($author->cover_image) {
                $mediaIds[] = $author->cover_image;
            }

            // Delete author via repo
            $this->authorRepo->delete($author->id);
        }

        // Delete media files
        $mediaService = app(MediaService::class);
        $mediaResult = $mediaService->bulkDeleteMediaImages(array_unique($mediaIds));

        return response()->json([
            'success' => true,
            'message' => __('messages.delete_success', ['name' => 'Authors']),
            'deleted_authors' => $authors->count(),
            'deleted_media' => $mediaResult['deleted'],
            'failed_media' => $mediaResult['failed'],
        ]);
    }
}
