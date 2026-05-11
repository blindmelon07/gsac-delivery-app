<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('customer', 'rider', 'items.product')->latest()->get();
        $riders = User::role('rider')->where('is_active', true)->get(['id', 'name']);

        return Inertia::render('Admin/Orders', [
            'orders' => $orders,
            'riders' => $riders,
        ]);
    }

    public function updateStatus(Order $order, Request $request)
    {
        $request->validate([
            'status' => ['required', 'in:pending,confirmed,preparing,out_for_delivery,delivered,cancelled'],
        ]);

        $order->update(['status' => $request->status]);

        return back()->with('success', 'Order status updated.');
    }

    public function assignRider(Order $order, Request $request)
    {
        $request->validate([
            'rider_id' => ['required', 'exists:users,id'],
        ]);

        $order->update([
            'rider_id' => $request->rider_id,
            'status' => 'out_for_delivery',
        ]);

        return back()->with('success', 'Rider assigned successfully.');
    }
}
