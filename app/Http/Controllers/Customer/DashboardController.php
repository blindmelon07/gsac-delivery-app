<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::forCustomer($user->id)->with('items.product')->latest()->get();

        $stats = [
            'total_orders' => $orders->count(),
            'pending_orders' => $orders->where('status', 'pending')->count(),
            'delivered_orders' => $orders->where('status', 'delivered')->count(),
            'total_spent' => $orders->where('status', 'delivered')->sum('total_amount'),
        ];

        return Inertia::render('Customer/Dashboard', [
            'stats' => $stats,
            'recentOrders' => $orders->take(5)->values(),
        ]);
    }

    public function shop(Request $request)
    {
        $query = Product::active();

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'description' => $p->description,
            'price' => $p->price,
            'category' => $p->category,
            'unit' => $p->unit,
            'image_url' => $p->image_url,
            'stock' => $p->stock,
        ]);

        return Inertia::render('Customer/Shop', [
            'products' => $products,
            'categories' => Product::$categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    public function profile(Request $request)
    {
        return Inertia::render('Customer/Profile', [
            'user' => $request->user(),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string'],
        ]);

        $request->user()->update($request->only('name', 'phone', 'address'));

        return back()->with('success', 'Profile updated successfully.');
    }
}
