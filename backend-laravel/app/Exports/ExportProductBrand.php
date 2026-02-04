<?php

namespace App\Exports;

use App\Models\ProductBrand;
use Maatwebsite\Excel\Concerns\FromCollection;

class ExportProductBrand implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return ProductBrand::select('id',)->get();
    }
}
