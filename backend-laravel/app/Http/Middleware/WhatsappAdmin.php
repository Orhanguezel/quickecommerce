<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class WhatsappAdmin
{
    public function handle(Request $request, Closure $next)
    {
        abort_unless($request->user() instanceof \App\Models\User && $request->user()->activity_scope === 'system_level', 403);

        return $next($request);
    }
}
