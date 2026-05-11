<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::forCustomer($request->user()->id)
            ->with('items.product')
            ->latest()
            ->get();

        return Inertia::render('Customer/Orders', ['orders' => $orders]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'delivery_address' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $total = 0;
        $orderItems = [];
        foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);
            $subtotal = $product->price * $item['quantity'];
            $total += $subtotal;
            $orderItems[] = [
                'product_id' => $product->id,
                'quantity' => $item['quantity'],
                'unit_price' => $product->price,
                'subtotal' => $subtotal,
            ];
        }

        $order = Order::create([
            'customer_id' => $request->user()->id,
            'status' => 'pending',
            'total_amount' => $total,
            'delivery_fee' => 49.00,
            'delivery_address' => $request->delivery_address,
            'notes' => $request->notes,
        ]);

        foreach ($orderItems as $item) {
            $order->items()->create($item);
        }

        return redirect()->route('customer.payment.show', $order->id)
            ->with('success', 'Order placed! Complete your payment below.');
    }

    public function show(Order $order, Request $request)
    {
        abort_unless($order->customer_id === $request->user()->id, 403);

        return Inertia::render('Customer/OrderDetail', [
            'order' => $order->load('items.product', 'rider'),
        ]);
    }

    public function cancel(Order $order, Request $request)
    {
        abort_unless($order->customer_id === $request->user()->id, 403);
        abort_unless($order->canBeCancelled(), 422, 'This order cannot be cancelled.');

        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Order cancelled.');
    }
}
