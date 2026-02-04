<?php

namespace App\Repositories;

use App\Models\StoreSeller;
use Prettus\Repository\Criteria\RequestCriteria;
use Prettus\Repository\Eloquent\BaseRepository;
use Prettus\Repository\Exceptions\RepositoryException;

/**
 *
 * @package namespace App\Repositories;
 */
class StoreSellerRepository extends BaseRepository
{

    public function model()
    {
        return StoreSeller::class;
    }

    public function boot()
    {
        try {
            $this->pushCriteria(app(RequestCriteria::class));
        } catch (RepositoryException $e) {
            //
        }
    }

    public function store($user_id)
    {
        $data = [
            'user_id' => $user_id,
        ];
            // Create new category
            $category = $this->create($data);

        return $category;
    }
    
}
