<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\AuditLog;

class AuthController extends Controller
{
    /**
     * Handle user login
     */
    public function login(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'password' => 'required',
        ]);

        $user = User::find($request->user_id);

        if (!$user || !Hash::check($request->password, $user->password)) {
            // Log failed login attempt
            AuditLog::create([
                'user_id' => null,
                'action' => 'login_failed',
                'description' => 'Failed login attempt for user ID: ' . $request->user_id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => 'ID User atau password salah.',
            ], 401);
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log successful login
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => 'User logged in successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role, // Include role for RBAC
            ],
            'token' => $token,
        ]);
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request)
    {
        // Log logout activity
        AuditLog::log('logout', 'User logged out');

        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Get current authenticated user
     */
    public function user(Request $request)
    {
        return response()->json([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
            'role' => $request->user()->role, // Include role
        ]);
    }
}
