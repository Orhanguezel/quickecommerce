<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\Request;

class PaymentSettingsController extends Controller
{
    public function paymentSettings(Request $request)
    {
        if ($request->isMethod('POST')) {
            $this->validate($request, [
                'com_maintenance_title' => 'nullable|string',
            ]);
            $com_maintenance_title = com_option_get('com_maintenance_title');
            return $this->success([
                'com_maintenance_title' => $com_maintenance_title,
            ]);
        }

    }
}
