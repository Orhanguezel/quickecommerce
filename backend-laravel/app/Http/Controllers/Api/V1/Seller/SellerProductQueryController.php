<?php

namespace App\Http\Controllers\Api\V1\Seller;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Http\Resources\Seller\SellerProductQueryResource;
use App\Interfaces\ProductQueryManageInterface;
use App\Models\ProductQuery;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SellerProductQueryController extends Controller
{
    public function __construct(protected ProductQueryManageInterface $productQueryRepo)
    {

    }

    public function getQuestions(Request $request)
    {
        $filters = [
            "date_filter" => $request->date_filter,
            "reply_status" => $request->reply_status,
            "per_page" => $request->per_page,
        ];
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $filters['store_ids'] = $seller_stores;
        $questions = $this->productQueryRepo->getSellerQuestions($filters);
        if ($questions->isEmpty()) {
            return [];
        }
        if ($questions) {
            return response()->json([
                'data' => SellerProductQueryResource::collection($questions),
                'meta' => new PaginationResource($questions)
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 500);
        }
    }

    public function replyQuestion(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'question_id' => 'required|integer|exists:product_queries,id',
            'reply' => 'required|string|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $seller = auth('api')->user();
        $seller_stores = Store::where('store_seller_id', $seller->id)->pluck('id');
        $question = ProductQuery::find($request->question_id);
        if (!$seller_stores->contains($question->store_id)) {
            return response()->json([
                'message' => __('messages.store.doesnt.belongs.to.seller')
            ], 422);
        }
        $reply = $this->productQueryRepo->replyQuestion($request->all());
        if ($reply) {
            return response()->json([
                'message' => __('messages.reply_success')
            ], 200);
        } else {
            return response()->json([
                'message' => __('messages.data_not_found')
            ], 404);
        }
    }
}
