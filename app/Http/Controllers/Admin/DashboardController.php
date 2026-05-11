<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'total_revenue' => Order::where('status', 'delivered')->sum('total_amount'),
            'total_products' => Product::count(),
            'total_customers' => User::role('customer')->count(),
            'total_riders' => User::role('rider')->count(),
        ];

        $recentOrders = Order::with('customer', 'rider')
            ->latest()
            ->take(10)
            ->get();

        $revenueByDay = Order::where('status', 'delivered')
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->take(30)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'revenueByDay' => $revenueByDay,
        ]);
    }
}
