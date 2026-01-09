<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Acceptable roles for this route
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Check if user has one of the required roles
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. Required role: ' . implode(', ', $roles),
                'your_role' => $request->user()->role
            ], 403);
        }

        return $next($request);
    }
}
