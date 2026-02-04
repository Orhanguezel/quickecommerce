<?php

namespace App\Interfaces;

use Illuminate\Http\Request;

interface StoreManageInterface
{
    public function getAllStores(int|string $limit, int|string $status, int $page, string $language, string $search, string $sortField, string $sort, array $filters);

    public function getAuthSellerStores(int|string $limit, int $page, string $language, string $search, string $sortField, string $sort, array $filters);

    public function store(array $data);

    public function storeForAuthSeller(array $data);

    public function update(array $data);

    public function updateForSeller(array $data);

    public function delete(int|string $id);

    public function getStoreById(int|string $id);

    public function storeTranslation(Request $request, int|string $refid, string $refPath, array $colNames);

    public function updateTranslation(Request $request, int|string $refid, string $refPath, array $colNames);

    public function translationKeys();

    public function records(bool $onlyDeleted);

    public function getOwnerStores();

    public function getSummaryData(string $slug, ?int $seller_id);

    public function getSalesSummaryData(array $filters, ?string $slug);

    public function getOtherSummaryData(?string $slug);

    public function getOrderGrowthData(?string $slug = null);

    public function storeDashboard(string $slug);

    public function getSellerWiseStores(?int $sellerId, ?string $search);

    public function approveStores(array $ids);

    public function rejectStores(array $ids);

    public function changeStatus(array $data);

    public function deleteSellerRelatedAllData(int|string $id);
}
