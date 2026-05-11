<?php

namespace App\Http\Controllers\Rider;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $riderId = $request->user()->id;

        $activeDeliveries = Order::forRider($riderId)->active()->with('customer', 'items')->get();
        $availableOrders = Order::available()->with('customer', 'items')->get();

        $stats = [
            'active_deliveries' => $activeDeliveries->count(),
            'total_delivered' => Order::forRider($riderId)->where('status', 'delivered')->count(),
            'today_earnings' => Order::forRider($riderId)
                ->where('status', 'delivered')
                ->whereDate('delivered_at', today())
                ->sum('delivery_fee'),
        ];

        return Inertia::render('Rider/Dashboard', [
            'stats' => $stats,
            'activeDeliveries' => $activeDeliveries,
            'availableOrders' => $availableOrders,
        ]);
    }

    public function earnings(Request $request)
    {
        $riderId = $request->user()->id;

        $earningsByDay = Order::forRider($riderId)
            ->where('status', 'delivered')
            ->selectRaw('DATE(delivered_at) as date, SUM(delivery_fee) as earnings, COUNT(*) as deliveries')
            ->groupBy('date')
            ->orderBy('date')
            ->take(30)
            ->get();

        $totalEarnings = Order::forRider($riderId)->where('status', 'delivered')->sum('delivery_fee');

        return Inertia::render('Rider/Earnings', [
            'earningsByDay' => $earningsByDay,
            'totalEarnings' => $totalEarnings,
        ]);
    }
}
