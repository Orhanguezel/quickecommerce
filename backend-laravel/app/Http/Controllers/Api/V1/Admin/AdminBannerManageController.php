<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\AdminBannerRequest;
use App\Http\Resources\Admin\AdminBannerDetailsResource;
use App\Http\Resources\Admin\AdminBannerResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Interfaces\BannerInterface;
use Illuminate\Http\Request;

class AdminBannerManageController extends Controller
{
    public function __construct(protected BannerInterface $bannerRepo)
    {

    }

    public function listBanners(Request $request)
    {
        $banner = $this->bannerRepo->getPaginatedBanner(
            $request->per_page ?? 10,
            $request->page ?? 1,
            $request->language ?? 'en',
            $request->search ?? "",
            $request->sortField ?? 'id',
            $request->sort ?? 'asc',
            []
        );
        return response()->json([
            'data' => AdminBannerResource::collection($banner),
            'meta' => new PaginationResource($banner)
        ]);
    }

    public function createBanner(AdminBannerRequest $request)
    {
        $banner = $this->bannerRepo->store($request->all());
        createOrUpdateTranslation($request, $banner, 'App\Models\Banner', $this->bannerRepo->translationKeys());
        if ($banner) {
            return $this->success(__('messages.save_success', ['name' => 'Banner']));
        } else {
            return $this->failed(__('messages.save_failed', ['name' => 'Banner']));
        }
    }

    public function updateBanner(AdminBannerRequest $request)
    {
        $banner = $this->bannerRepo->update($request->all());
        createOrUpdateTranslation($request, $banner, 'App\Models\Banner', $this->bannerRepo->translationKeys());
        if ($banner) {
            return $this->success(translate('messages.update_success', ['name' => 'Banner']));
        } else {
            return $this->failed(translate('messages.update_failed', ['name' => 'Banner']));
        }
    }

    public function changeBannerStatus(Request $request)
    {
        $success = $this->bannerRepo->changeStatus($request->id);
        if ($success) {
            return response()->json([
                'message' => __('messages.update_success', ['name' => 'Banner status']),
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.update_failed', ['name' => 'Banner status']),
            ], 500);
        }
    }

    public function getBannerById(Request $request)
    {
        $banner = $this->bannerRepo->getBannerById($request->id);
        return response()->json(new AdminBannerDetailsResource($banner));
    }

    public function deleteBanner($id)
    {
        $this->bannerRepo->delete($id);
        return $this->success(translate('messages.delete_success', ['name' => 'Banner']));
    }
}
