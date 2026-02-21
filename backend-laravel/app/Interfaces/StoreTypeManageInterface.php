<?php

namespace App\Interfaces;

use Illuminate\Http\Request;

interface StoreTypeManageInterface
{
    public function getAllStoreTypes(array $filters);

    public function getStoreTypeById(int $id);

    public function createStoreType(array $data);

    public function updateStoreType(array $data);
    public function toogleStatus(int $id);
    public function createOrUpdateTranslation(Request $request, int|string $refid, string $refPath, array $colNames);
}
