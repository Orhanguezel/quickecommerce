<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Services\SitemapService;
use Illuminate\Http\Request;

class AdminSitemapController
{
    public function generate(Request $request, SitemapService $sitemapService)
    {
        if ($request->isMethod('POST')) {
            return $sitemapService->generate(); // handles generation, DB insert, and download
        } else {
            $sitemap = \App\Models\Sitemap::orderBy('generated_at', 'desc')->first();
            return response()->json([
                'data' => $sitemap
            ]);
        }
    }

}
