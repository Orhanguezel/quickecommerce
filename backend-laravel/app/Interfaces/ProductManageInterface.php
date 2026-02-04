<?php

namespace App\Interfaces;

use Illuminate\Http\Request;

interface ProductManageInterface
{
    public function getPaginatedProduct(int|string $store_id, string $status, int|string $limit, int $page, string $language, string $type, string $search, string $sortField, string $sort, array $filters);

    public function store(array $data);

    public function update(array $data);

    public function getProductBySlug(string $slug);

    public function storeTranslation(Request $request, int|string $refid, string $refPath, array $colNames);

    public function updateTranslation(Request $request, int|string $refid, string $refPath, array $colNames);

    public function translationKeys();

    public function delete(int|string $id);

    public function records(bool $onlyDeleted);

    public function changeStatus(array $data);

    public function getPendingProducts();

    public function approvePendingProducts(array $productIds);
}
