<?php

namespace App\Repositories;

use App\Interfaces\InventoryManageInterface;
use App\Models\Product;
use App\Models\ProductVariant;

class ProductInventoryManageRepository implements InventoryManageInterface
{
    public function getInventories(?array $filters)
    {
        $inventories = Product::query();
        // Search by name, slug, or description
        if (isset($filters['search'])) {
            $searchTerm = $filters['search'];
            $inventories->where(function ($query) use ($searchTerm) {
                $query->where('name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('slug', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }
        // Filter by category
        if (isset($filters['category_id'])) {
            $inventories->where('category_id', $filters['category_id']);
        }
        // Filter by brand
        if (isset($filters['brand_id'])) {
            $inventories->where('brand_id', $filters['brand_id']);
        }
        // Filter by type
        if (isset($filters['type'])) {
            $inventories->where('type', $filters['type']);
        }
        // Filter by stock status
        if (isset($filters['stock_status'])) {
            if ($filters['stock_status'] === 'low_stock') {
                $inventories->lowStock(); // Scope for low stock
            } elseif ($filters['stock_status'] === 'out_of_stock') {
                $inventories->outOfStock(); // Scope for out of stock
            }
        }
        // Filter by store (for admin to filter by seller's store)
        if (isset($filters['store_id'])) {
            $inventories->where('store_id', $filters['store_id']);
        }
        return $inventories->with(['category', 'brand', 'variants', 'store.related_translations','related_translations'])->paginate($filters['per_page'] ?? 10);
    }

    public function updateVariant(array $data)
    {
        $variant = ProductVariant::findOrFail($data['variant_id']);
        $variant->update($data);
        return true;
    }

    public function deleteProductsWithVariants(array $productIds)
    {
        $products = Product::whereIn('id', $productIds)->get();

        if ($products->isEmpty()) {
            return false; // No products found
        }

        foreach ($products as $product) {
            $this->deleteProductWithVariants($product);
        }

        return true;
    }

    public function deleteProductWithVariants(Product $product)
    {
        $product->delete();
    }

    public function deleteVariants($productId)
    {
        ProductVariant::where('product_id', $productId)->delete();
    }

    public function getInventoriesForSeller(?array $filters)
    {
        $sellerId = auth('api')->id();
        // Start the query on the Product model and load related store
        $inventories = Product::query()
            // Filter products by the seller's store (store_seller_id)
            ->whereHas('store', function ($query) use ($sellerId) {
                $query->where('store_seller_id', $sellerId); // Filter by seller's store_seller_id
            });
        // Search by name, slug, or description
        if (isset($filters['search'])) {
            $searchTerm = $filters['search'];
            $inventories->where(function ($query) use ($searchTerm) {
                $query->where('name', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('slug', 'LIKE', "%{$searchTerm}%")
                    ->orWhere('description', 'LIKE', "%{$searchTerm}%");
            });
        }
        // Filter by category
        if (isset($filters['category_id'])) {
            $inventories->where('category_id', $filters['category_id']);
        }
        // Filter by brand
        if (isset($filters['brand_id'])) {
            $inventories->where('brand_id', $filters['brand_id']);
        }
        // Filter by type
        if (isset($filters['type'])) {
            $inventories->where('type', $filters['type']);
        }
        // Filter by stock status
        if (isset($filters['stock_status'])) {
            if ($filters['stock_status'] === 'low_stock') {
                $inventories->lowStock(); // Scope for low stock
            } elseif ($filters['stock_status'] === 'out_of_stock') {
                $inventories->outOfStock(); // Scope for out of stock
            }
        }
        // Filter by store (for admin to filter by seller's store)
        if (isset($filters['store_id'])) {
            $inventories->where('store_id', $filters['store_id']);
        }
        return $inventories->with(['category', 'brand', 'variants', 'store'])->paginate($filters['per_page'] ?? 10);
    }

}
