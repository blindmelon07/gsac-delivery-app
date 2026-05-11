<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymongoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function __construct(private PaymongoService $paymongo) {}

    public function show(Order $order, Request $request)
    {
        abort_unless($order->customer_id === $request->user()->id, 403);

        if ($order->payment_status === 'paid') {
            return redirect()->route('customer.orders');
        }

        return Inertia::render('Customer/Payment', [
            'order' => [
                'id' => $order->id,
                'total_amount' => $order->total_amount,
                'delivery_fee' => $order->delivery_fee,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'paymongo_payment_intent_id' => $order->paymongo_payment_intent_id,
            ],
        ]);
    }

    public function initiate(Order $order, Request $request)
    {
        abort_unless($order->customer_id === $request->user()->id, 403);

        if ($order->payment_status === 'paid') {
            return response()->json(['already_paid' => true]);
        }

        $user = $request->user();
        $totalWithFee = (float) $order->total_amount + (float) $order->delivery_fee;
        $amountCentavos = (int) round($totalWithFee * 100);

        try {
            $result = $this->paymongo->initiateQrPh(
                amountCentavos: $amountCentavos,
                name: $user->name,
                email: $user->email,
                phone: $user->phone ?? '',
                returnUrl: route('customer.payment.show', $order->id),
                description: "Gsac Delivery Order #{$order->id}",
            );

            $order->update([
                'paymongo_payment_intent_id' => $result['payment_intent_id'],
                'payment_status' => 'pending',
            ]);

            return response()->json([
                'qr_image' => $result['qr_image'],
                'expires_at' => $result['expires_at'],
                'payment_intent_id' => $result['payment_intent_id'],
                'status' => $result['status'],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function checkStatus(Order $order, Request $request)
    {
        abort_unless($order->customer_id === $request->user()->id, 403);

        if (!$order->paymongo_payment_intent_id) {
            return response()->json(['status' => 'unpaid']);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['status' => 'paid']);
        }

        try {
            $intent = $this->paymongo->getPaymentIntent($order->paymongo_payment_intent_id);
            $status = $intent['attributes']['status'] ?? 'awaiting_payment_method';

            if ($status === 'succeeded') {
                $payments = $intent['attributes']['payments'] ?? [];
                $paymentId = !empty($payments) ? $payments[0]['id'] : null;

                $order->update([
                    'payment_status' => 'paid',
                    'paymongo_payment_id' => $paymentId,
                    'status' => 'confirmed',
                ]);

                return response()->json(['status' => 'paid']);
            }

            if (in_array($status, ['payment_error', 'failed'])) {
                $order->update(['payment_status' => 'failed']);
                return response()->json(['status' => 'failed']);
            }

            return response()->json(['status' => $status]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}
