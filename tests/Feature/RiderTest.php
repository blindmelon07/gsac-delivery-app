<?php

use App\Models\Order;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'rider', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

// --- Access control ---

test('guest cannot access rider dashboard', function () {
    $this->get('/rider/dashboard')->assertRedirect('/login');
});

test('customer cannot access rider dashboard', function () {
    $this->actingAs(userWithRole('customer'))
        ->get('/rider/dashboard')
        ->assertStatus(403);
});

// --- Dashboard ---

test('rider can view dashboard', function () {
    $this->actingAs(userWithRole('rider'))
        ->get('/rider/dashboard')
        ->assertInertia(fn ($page) =>
            $page->component('Rider/Dashboard')
                 ->has('stats')
                 ->has('activeDeliveries')
                 ->has('availableOrders')
        );
});

// --- Deliveries ---

test('rider can view deliveries', function () {
    $this->actingAs(userWithRole('rider'))
        ->get('/rider/deliveries')
        ->assertInertia(fn ($page) => $page->component('Rider/Deliveries'));
});

test('rider can accept an available order', function () {
    $rider = userWithRole('rider');
    $order = Order::factory()->confirmed()->create([
        'customer_id' => userWithRole('customer')->id,
        'rider_id' => null,
    ]);

    $this->actingAs($rider)
        ->post("/rider/deliveries/{$order->id}/accept");

    $order->refresh();
    expect($order->rider_id)->toBe($rider->id);
    expect($order->status)->toBe('out_for_delivery');
});

test('rider cannot accept an already-taken order', function () {
    $rider = userWithRole('rider');
    $otherRider = userWithRole('rider');
    $order = Order::factory()->create([
        'customer_id' => userWithRole('customer')->id,
        'status' => 'out_for_delivery',
        'rider_id' => $otherRider->id,
    ]);

    $this->actingAs($rider)
        ->post("/rider/deliveries/{$order->id}/accept")
        ->assertStatus(422);
});

test('rider can mark order as picked up', function () {
    $rider = userWithRole('rider');
    $order = Order::factory()->create([
        'customer_id' => userWithRole('customer')->id,
        'status' => 'out_for_delivery',
        'rider_id' => $rider->id,
    ]);

    $this->actingAs($rider)
        ->post("/rider/deliveries/{$order->id}/pickup");

    expect($order->fresh()->status)->toBe('preparing');
});

test('rider can mark order as delivered', function () {
    $rider = userWithRole('rider');
    $order = Order::factory()->create([
        'customer_id' => userWithRole('customer')->id,
        'status' => 'preparing',
        'rider_id' => $rider->id,
    ]);

    $this->actingAs($rider)
        ->post("/rider/deliveries/{$order->id}/deliver");

    $order->refresh();
    expect($order->status)->toBe('delivered');
    expect($order->delivered_at)->not->toBeNull();
});

test('rider cannot mark another riders order as delivered', function () {
    $rider = userWithRole('rider');
    $otherRider = userWithRole('rider');
    $order = Order::factory()->create([
        'customer_id' => userWithRole('customer')->id,
        'status' => 'preparing',
        'rider_id' => $otherRider->id,
    ]);

    $this->actingAs($rider)
        ->post("/rider/deliveries/{$order->id}/deliver")
        ->assertStatus(403);
});

// --- History ---

test('rider can view delivery history', function () {
    $rider = userWithRole('rider');
    Order::factory()->delivered()->count(3)->create([
        'customer_id' => userWithRole('customer')->id,
        'rider_id' => $rider->id,
    ]);

    $this->actingAs($rider)
        ->get('/rider/history')
        ->assertInertia(fn ($page) =>
            $page->component('Rider/History')
                 ->has('deliveries', 3)
        );
});

// --- Earnings ---

test('rider can view earnings', function () {
    $this->actingAs(userWithRole('rider'))
        ->get('/rider/earnings')
        ->assertInertia(fn ($page) =>
            $page->component('Rider/Earnings')
                 ->has('totalEarnings')
        );
});
