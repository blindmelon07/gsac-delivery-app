<?php

use App\Models\Order;
use App\Models\User;
use App\Services\PaymongoService;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'rider', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

// --- Payment page ---

test('customer can view payment page for their own order', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->pending()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->get("/customer/orders/{$order->id}/pay")
        ->assertInertia(fn ($page) => $page->component('Customer/Payment'));
});

test('customer cannot view payment page for another customers order', function () {
    $customer = userWithRole('customer');
    $other = userWithRole('customer');
    $order = Order::factory()->pending()->create(['customer_id' => $other->id]);

    $this->actingAs($customer)
        ->get("/customer/orders/{$order->id}/pay")
        ->assertStatus(403);
});

test('already-paid order redirects away from payment page', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->paid()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->get("/customer/orders/{$order->id}/pay")
        ->assertStatus(302);
});

// --- Initiate QR payment ---

test('initiate returns qr data from paymongo service', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->pending()->create([
        'customer_id' => $customer->id,
        'total_amount' => 200.00,
        'delivery_fee' => 49.00,
    ]);

    $mock = Mockery::mock(PaymongoService::class);
    $mock->shouldReceive('initiateQrPh')
        ->once()
        ->with(24900, $customer->name, $customer->email, '', Mockery::any(), Mockery::any())
        ->andReturn([
            'payment_intent_id' => 'pi_test_123',
            'status' => 'awaiting_payment_method',
            'qr_image' => 'data:image/png;base64,abc123',
            'expires_at' => now()->addMinutes(30)->timestamp,
        ]);

    $this->app->instance(PaymongoService::class, $mock);

    $this->actingAs($customer)
        ->postJson("/customer/orders/{$order->id}/pay/initiate")
        ->assertOk()
        ->assertJsonStructure(['qr_image', 'expires_at', 'payment_intent_id', 'status']);

    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'paymongo_payment_intent_id' => 'pi_test_123',
        'payment_status' => 'pending',
    ]);
});

test('initiate returns already_paid when order is already paid', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->paid()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->postJson("/customer/orders/{$order->id}/pay/initiate")
        ->assertOk()
        ->assertJson(['already_paid' => true]);
});

test('initiate returns error when paymongo service fails', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->pending()->create(['customer_id' => $customer->id]);

    $mock = Mockery::mock(PaymongoService::class);
    $mock->shouldReceive('initiateQrPh')
        ->once()
        ->andThrow(new \RuntimeException('PayMongo API error'));

    $this->app->instance(PaymongoService::class, $mock);

    $this->actingAs($customer)
        ->postJson("/customer/orders/{$order->id}/pay/initiate")
        ->assertStatus(422)
        ->assertJson(['error' => 'PayMongo API error']);
});

// --- Check status ---

test('status endpoint returns paid when payment intent succeeded', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'payment_status' => 'pending',
        'status' => 'pending',
        'paymongo_payment_intent_id' => 'pi_test_456',
    ]);

    $mock = Mockery::mock(PaymongoService::class);
    $mock->shouldReceive('getPaymentIntent')
        ->once()
        ->with('pi_test_456')
        ->andReturn([
            'attributes' => [
                'status' => 'succeeded',
                'payments' => [['id' => 'pay_test_789']],
            ],
        ]);

    $this->app->instance(PaymongoService::class, $mock);

    $this->actingAs($customer)
        ->getJson("/customer/orders/{$order->id}/pay/status")
        ->assertOk()
        ->assertJson(['status' => 'paid']);

    $order->refresh();
    expect($order->payment_status)->toBe('paid');
    expect($order->status)->toBe('confirmed');
    expect($order->paymongo_payment_id)->toBe('pay_test_789');
});

test('status endpoint returns unpaid when no intent exists', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->pending()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->getJson("/customer/orders/{$order->id}/pay/status")
        ->assertOk()
        ->assertJson(['status' => 'unpaid']);
});

test('status returns already paid without calling api', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->paid()->create([
        'customer_id' => $customer->id,
        'paymongo_payment_intent_id' => 'pi_test_paid',
    ]);

    $mock = Mockery::mock(PaymongoService::class);
    $mock->shouldNotReceive('getPaymentIntent');
    $this->app->instance(PaymongoService::class, $mock);

    $this->actingAs($customer)
        ->getJson("/customer/orders/{$order->id}/pay/status")
        ->assertOk()
        ->assertJson(['status' => 'paid']);
});

// --- Webhook ---

test('paymongo webhook marks order as paid on payment.paid event', function () {
    $order = Order::factory()->create([
        'customer_id' => userWithRole('customer')->id,
        'payment_status' => 'pending',
        'status' => 'pending',
        'paymongo_payment_intent_id' => 'pi_webhook_test',
    ]);

    // Disable signature verification for test
    config(['services.paymongo.webhook_secret' => null]);

    $payload = json_encode([
        'data' => [
            'attributes' => [
                'type' => 'payment.paid',
                'data' => [
                    'id' => 'pay_webhook_001',
                    'attributes' => [
                        'payment_intent_id' => 'pi_webhook_test',
                    ],
                ],
            ],
        ],
    ]);

    $this->postJson('/webhooks/paymongo', json_decode($payload, true), [
        'Content-Type' => 'application/json',
    ])->assertOk();

    $order->refresh();
    expect($order->payment_status)->toBe('paid');
    expect($order->status)->toBe('confirmed');
    expect($order->paymongo_payment_id)->toBe('pay_webhook_001');
});

test('paymongo webhook marks order payment as failed on payment.failed', function () {
    $order = Order::factory()->create([
        'customer_id' => userWithRole('customer')->id,
        'payment_status' => 'pending',
        'paymongo_payment_intent_id' => 'pi_fail_test',
    ]);

    config(['services.paymongo.webhook_secret' => null]);

    $this->postJson('/webhooks/paymongo', [
        'data' => [
            'attributes' => [
                'type' => 'payment.failed',
                'data' => [
                    'id' => 'pay_fail_001',
                    'attributes' => [
                        'payment_intent_id' => 'pi_fail_test',
                    ],
                ],
            ],
        ],
    ])->assertOk();

    expect($order->fresh()->payment_status)->toBe('failed');
});

test('paymongo webhook returns 401 on invalid signature', function () {
    config(['services.paymongo.webhook_secret' => 'real_secret']);

    $this->postJson('/webhooks/paymongo', ['data' => []], [
        'Paymongo-Signature' => 't=1234,li=invalidsig',
    ])->assertStatus(401);
});
