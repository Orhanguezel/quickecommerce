<?php

namespace App\Interfaces;

use Illuminate\Http\Request;

interface BannerInterface
{
    public function translationKeys();

    public function getPaginatedBanner(int|string $per_page, int $page, string $language, string $search, string $sortField, string $sort, array $filters);

    public function store(array $data);

    public function getBannerById(int|string $id);

    public function update(array $data);

    public function changeStatus(int $id);

    public function delete(int|string $id);

    public function storeTranslation(Request $request, int|string $refid, string $refPath, array $colNames);

    public function updateTranslation(Request $request, int|string $refid, string $refPath, array $colNames);
}
