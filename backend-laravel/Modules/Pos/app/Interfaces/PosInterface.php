<?php

namespace Modules\Pos\app\Interfaces;

use Illuminate\Http\Request;

interface PosInterface
{
    public function getStoreCustomers($storeId, $filters);

    public function createNewCustomer(Request $request);

    public function getProducts(Request $request, $storeId);

    public function getProductBySlug($slug);

    public function getOrders(Request $request);
}