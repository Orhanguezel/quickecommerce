<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\NoticeRequest;
use App\Http\Resources\Admin\AdminNoticeDetailsResource;
use App\Http\Resources\Admin\AdminNoticeResource;
use App\Http\Resources\Com\Pagination\PaginationResource;
use App\Interfaces\AllNoticeManageInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminStoreNoticeController extends Controller
{
    public function __construct(protected AllNoticeManageInterface $noticeRepo)
    {

    }

    public function index(Request $request)
    {
        $filters = [
            'priority' => $request->input('priority'),
            'status' => $request->input('status'),
            'type' => $request->input('type'),
            'search' => $request->input('search'),
            'per_page' => $request->input('per_page'),
        ];
        $notices = $this->noticeRepo->getNotice($filters);
        return response()->json([
            'data' => AdminNoticeResource::collection($notices),
            'meta' => new PaginationResource($notices),
        ]);
    }

    public function store(NoticeRequest $request)
    {
        if ($request->type == 'general' && (isset($request->store_id) || isset($request->seller_id))) {
            return response()->json([
                'message' => 'General notices are not allowed to assign specific store or seller'
            ],400);
        }
        $success = $this->noticeRepo->createNotice($request->all());
        createOrUpdateTranslation($request, $success, 'App\Models\StoreNotice', $this->noticeRepo->translationKeys());
        if ($success) {
            return $this->success(__('messages.save_success', ['name' => 'Notice']),200);
        } else {
            return $this->failed(__('messages.save_failed', ['name' => 'Notice']),500);
        }
    }

    public function show(Request $request)
    {
        $notice = $this->noticeRepo->getById($request->id);
        return response()->json(new AdminNoticeDetailsResource($notice));
    }

    public function update(NoticeRequest $request)
    {
        if ($request->type == 'general' && (isset($request->store_id) || isset($request->seller_id))) {
            return response()->json([
                'message' => 'General notices are not allowed to assign specific store or seller'
            ],400);
        }
        $success = $this->noticeRepo->updateNotice($request->all());
        createOrUpdateTranslation($request, $success, 'App\Models\StoreNotice', $this->noticeRepo->translationKeys());
        if ($success) {
            return $this->success(__('messages.update_success', ['name' => 'Notice']),200);
        } else {
            return $this->failed(__('messages.update_failed', ['name' => 'Notice']),500);
        }
    }

    public function changeStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
        $success = $this->noticeRepo->toggleStatus($request->id);
        if ($success) {
            return $this->success(__('messages.update_success', ['name' => 'Notice status']));
        } else {
            return $this->failed(__('messages.update_failed', ['name' => 'Notice status']),500);
        }
    }

    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array|min:1',
            'ids.*' => 'nullable|exists:store_notices,id',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        foreach ($request->ids as $id) {
            $success = $this->noticeRepo->deleteNotice($id);
        }

        return $this->success(__('messages.delete_success', ['name' => 'Notices']));
    }
}
