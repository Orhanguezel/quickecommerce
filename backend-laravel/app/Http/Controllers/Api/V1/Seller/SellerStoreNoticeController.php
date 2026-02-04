<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Seller\SellerNoticeDetailsResource;
use App\Http\Resources\Seller\SellerNoticeResource;
use App\Interfaces\AllNoticeManageInterface;
use Illuminate\Http\Request;

class SellerStoreNoticeController extends Controller
{
    public function __construct(protected AllNoticeManageInterface $noticeRepo)
    {

    }

    public function index()
    {
        $notices = $this->noticeRepo->getSellerStoreNotices();
        if (!empty($notices)) {
            return response()->json([
                'data' => SellerNoticeResource::collection($notices),
                'meta' => new PaginationResource($notices),
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 404,
                'message' => __('messages.data_not_found'),
            ]);
        }
    }

    public function show(Request $request)
    {
        $notice = $this->noticeRepo->getById($request->id);
        if ($notice) {
            return response()->json(new SellerNoticeDetailsResource($notice));
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 404,
                'message' => __('messages.data_not_found'),
            ]);
        }
    }
}
