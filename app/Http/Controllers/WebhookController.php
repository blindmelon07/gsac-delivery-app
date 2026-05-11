<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\PaymongoService;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function __construct(private PaymongoService $paymongo) {}

    public function paymongo(Request $request)
    {
        $signatureHeader = $request->header('Paymongo-Signature', '');
        $payload = $request->getContent();

        if (!$this->paymongo->verifyWebhookSignature($payload, $signatureHeader)) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $event = $request->json('data');
        $eventType = $event['attributes']['type'] ?? '';

        if ($eventType === 'payment.paid') {
            $paymentData = $event['attributes']['data']['attributes'] ?? [];
            $paymentIntentId = $paymentData['payment_intent_id'] ?? null;
            $paymentId = $event['attributes']['data']['id'] ?? null;

            if ($paymentIntentId) {
                $order = Order::where('paymongo_payment_intent_id', $paymentIntentId)->first();
                if ($order && $order->payment_status !== 'paid') {
                    $order->update([
                        'payment_status' => 'paid',
                        'paymongo_payment_id' => $paymentId,
                        'status' => 'confirmed',
                    ]);
                }
            }
        }

        if ($eventType === 'payment.failed') {
            $paymentIntentId = $event['attributes']['data']['attributes']['payment_intent_id'] ?? null;
            if ($paymentIntentId) {
                $order = Order::where('paymongo_payment_intent_id', $paymentIntentId)->first();
                if ($order && $order->payment_status === 'pending') {
                    $order->update(['payment_status' => 'failed']);
                }
            }
        }

        return response()->json(['received' => true]);
    }
}
