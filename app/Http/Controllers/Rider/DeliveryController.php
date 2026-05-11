<?php

namespace App\Http\Controllers\Rider;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $riderId = $request->user()->id;
        $activeDeliveries = Order::forRider($riderId)->active()->with('customer', 'items.product')->get();
        $availableOrders = Order::available()->with('customer', 'items.product')->get();

        return Inertia::render('Rider/Deliveries', [
            'activeDeliveries' => $activeDeliveries,
            'availableOrders' => $availableOrders,
        ]);
    }

    public function accept(Order $order, Request $request)
    {
        abort_unless($order->status === 'confirmed' && $order->rider_id === null, 422, 'Order not available.');

        $order->update([
            'rider_id' => $request->user()->id,
            'status' => 'out_for_delivery',
        ]);

        return back()->with('success', 'Order accepted.');
    }

    public function pickup(Order $order, Request $request)
    {
        abort_unless($order->rider_id === $request->user()->id, 403);
        abort_unless($order->status === 'out_for_delivery', 422);

        $order->update(['status' => 'preparing']);

        return back()->with('success', 'Marked as picked up.');
    }

    public function deliver(Order $order, Request $request)
    {
        abort_unless($order->rider_id === $request->user()->id, 403);

        $order->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        return back()->with('success', 'Order delivered!');
    }

    public function history(Request $request)
    {
        $deliveries = Order::forRider($request->user()->id)
            ->where('status', 'delivered')
            ->with('customer', 'items.product')
            ->latest('delivered_at')
            ->get();

        return Inertia::render('Rider/History', ['deliveries' => $deliveries]);
    }
}
