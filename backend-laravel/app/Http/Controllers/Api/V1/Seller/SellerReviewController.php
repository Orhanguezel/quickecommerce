<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Seller\SellerReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\Request;

class SellerReviewController extends Controller
{
    public function __construct(protected ReviewService $reviewService)
    {

    }

    public function index(Request $request)
    {
        $user = auth('api')->user();
        $isSeller = $user->activity_scope == 'store_level';
        if (!$isSeller) {
            return response()->json([
                'status' => false,
                'status_code' => 422,
                'message' => 'This user is not a seller!'
            ]);
        }
        $filters = [
            "min_rating" => $request->min_rating,
            "max_rating" => $request->min_rating,
            "rating" => $request->rating,
            "start_date" => $request->start_date,
            "end_date" => $request->end_date,
            "per_page" => $request->per_page,
        ];
        $reviews = $this->reviewService->getSellerReviews($filters,$user->id);
        if (!empty($reviews)) {
            return response()->json([
                'status' => true,
                'status_code' => 200,
                'message' => __('messages.data_found'),
                'data' => SellerReviewResource::collection($reviews),
                'meta' => new PaginationResource($reviews)
            ]);
        } else {
            return response()->json([
                'status' => false,
                'status_code' => 404,
                'message' => __('messages.data_not_found')
            ]);
        }
    }
}
