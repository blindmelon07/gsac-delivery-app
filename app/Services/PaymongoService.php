<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class PaymongoService
{
    private string $baseUrl = 'https://api.paymongo.com/v1';
    private string $secretKey;
    private string $publicKey;

    public function __construct()
    {
        $this->secretKey = config('services.paymongo.secret_key');
        $this->publicKey = config('services.paymongo.public_key');
    }

    private function secretHeaders(): array
    {
        return [
            'Authorization' => 'Basic ' . base64_encode($this->secretKey . ':'),
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];
    }

    public function createPaymentIntent(int $amountCentavos, string $description = 'Gsac Delivery Order'): array
    {
        $response = Http::withHeaders($this->secretHeaders())
            ->post("{$this->baseUrl}/payment_intents", [
                'data' => [
                    'attributes' => [
                        'amount' => $amountCentavos,
                        'payment_method_allowed' => ['qrph'],
                        'currency' => 'PHP',
                        'capture_type' => 'automatic',
                        'description' => $description,
                    ],
                ],
            ]);

        $this->throwIfFailed($response);
        return $response->json('data');
    }

    public function createQrPhPaymentMethod(string $name, string $email, string $phone = ''): array
    {
        $billing = ['name' => $name, 'email' => $email];
        if ($phone) $billing['phone'] = $phone;

        $response = Http::withHeaders($this->secretHeaders())
            ->post("{$this->baseUrl}/payment_methods", [
                'data' => [
                    'attributes' => [
                        'type' => 'qrph',
                        'billing' => $billing,
                    ],
                ],
            ]);

        $this->throwIfFailed($response);
        return $response->json('data');
    }

    public function attachPaymentMethod(string $paymentIntentId, string $paymentMethodId, string $returnUrl): array
    {
        $response = Http::withHeaders($this->secretHeaders())
            ->post("{$this->baseUrl}/payment_intents/{$paymentIntentId}/attach", [
                'data' => [
                    'attributes' => [
                        'payment_method' => $paymentMethodId,
                        'return_url' => $returnUrl,
                    ],
                ],
            ]);

        $this->throwIfFailed($response);
        return $response->json('data');
    }

    public function getPaymentIntent(string $paymentIntentId): array
    {
        $response = Http::withHeaders($this->secretHeaders())
            ->get("{$this->baseUrl}/payment_intents/{$paymentIntentId}");

        $this->throwIfFailed($response);
        return $response->json('data');
    }

    public function verifyWebhookSignature(string $payload, string $signatureHeader): bool
    {
        $webhookSecret = config('services.paymongo.webhook_secret');

        if (!$webhookSecret) return true;

        $parts = [];
        foreach (explode(',', $signatureHeader) as $part) {
            [$key, $value] = explode('=', $part, 2);
            $parts[$key] = $value;
        }

        if (!isset($parts['t'])) return false;

        $computedSignature = hash_hmac('sha256', "{$parts['t']}.{$payload}", $webhookSecret);
        $receivedSignature = $parts['li'] ?? $parts['te'] ?? '';

        return hash_equals($computedSignature, $receivedSignature);
    }

    public function initiateQrPh(int $amountCentavos, string $name, string $email, string $phone, string $returnUrl, string $description): array
    {
        $intent = $this->createPaymentIntent($amountCentavos, $description);
        $method = $this->createQrPhPaymentMethod($name, $email, $phone);
        $attached = $this->attachPaymentMethod($intent['id'], $method['id'], $returnUrl);

        $attrs = $attached['attributes'];
        $nextAction = $attrs['next_action'] ?? null;

        $qrImage = $nextAction['display_details']['qr_image'] ?? null;
        $expiresAt = $nextAction['display_details']['expires_at'] ?? null;

        return [
            'payment_intent_id' => $attached['id'],
            'status' => $attrs['status'],
            'qr_image' => $qrImage,
            'expires_at' => $expiresAt,
        ];
    }

    private function throwIfFailed(Response $response): void
    {
        if ($response->failed()) {
            $errors = $response->json('errors', []);
            $message = !empty($errors) ? $errors[0]['detail'] : 'PayMongo API error';
            throw new \RuntimeException($message, $response->status());
        }
    }
}
