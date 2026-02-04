<?php

namespace Modules\Pos\app\Models;

use App\Models\Customer;
use App\Models\Store;
use Illuminate\Database\Eloquent\Model;

class PosStoreCustomer extends Model
{
    protected $fillable = ['customer_id', 'store_id'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

}
