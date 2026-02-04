<?php

namespace App\Interfaces;

use Illuminate\Http\Request;

interface AllNoticeManageInterface
{
    public function createNotice(array $data);

    public function getNotice(array $filters);

    public function getById($id);

    public function updateNotice(array $data);

    public function toggleStatus($id);

    public function deleteNotice($id);

    public function getSellerStoreNotices();

    public function createOrUpdateTranslation(Request $request, int|string $refid, string $refPath, array $colNames);
}