<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->where('id', '!=', auth()->id())->latest()->get()->map(fn ($u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'phone' => $u->phone,
            'is_active' => $u->is_active,
            'avatar_url' => $u->avatar_url,
            'role' => $u->getRoleNames()->first(),
            'created_at' => $u->created_at,
        ]);

        return Inertia::render('Admin/Users', ['users' => $users]);
    }

    public function toggleActive(User $user)
    {
        $user->update(['is_active' => !$user->is_active]);
        return back()->with('success', 'User status updated.');
    }
}
