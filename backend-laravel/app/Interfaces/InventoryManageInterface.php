<?php

namespace App\Interfaces;
interface InventoryManageInterface
{
    public function getInventories(?array $filters);

    public function updateVariant(array $data);

    public function deleteProductsWithVariants(array $productIds);

    public function getInventoriesForSeller(?array $filters);
}
