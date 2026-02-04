<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\SellerBannerRequest;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Seller\SellerBannerDetailsResource;
use App\Http\Resources\Seller\SellerBannerResource;
use App\Interfaces\BannerInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerBannerManageController extends Controller
{
    public function __construct(protected BannerInterface $bannerRepo)
    {

    }

    public function listBanners(Request $request)
    {
        $banner = $this->bannerRepo->getPaginatedBanner(
            $request->limit ?? 10,
            $request->page ?? 1,
            $request->language ?? DEFAULT_LANGUAGE,
            $request->search ?? "",
            $request->sortField ?? 'id',
            $request->sort ?? 'asc',
            []
        );
        return response()->json([
            'data' => SellerBannerResource::collection($banner),
            'meta' => new PaginationResource($banner)
        ]);
    }

    public function createBanner(SellerBannerRequest $request): JsonResponse
    {
        $banner = $this->bannerRepo->store($request->all());
        createOrUpdateTranslation($request, $banner, 'App\Models\Banner', $this->bannerRepo->translationKeys());
        if ($banner) {
            return $this->success(translate('messages.save_success', ['name' => 'Banner']));
        } else {
            return $this->failed(translate('messages.save_failed', ['name' => 'Banner']));
        }
    }

    public function updateBanner(SellerBannerRequest $request)
    {
        $banner = $this->bannerRepo->update($request->all());
        createOrUpdateTranslation($request, $banner, 'App\Models\Banner', $this->bannerRepo->translationKeys());
        if ($banner) {
            return $this->success(translate('messages.update_success', ['name' => 'Banner']));
        } else {
            return $this->failed(translate('messages.update_failed', ['name' => 'Banner']));
        }
    }

    public function getBannerById(Request $request)
    {
        $banner = $this->bannerRepo->getBannerById($request->id);
        return response()->json(new SellerBannerDetailsResource($banner));
    }

    public function deleteBanner($id)
    {
        $this->bannerRepo->delete($id);
        return $this->success(translate('messages.delete_success', ['name' => 'Banner']));
    }
}
