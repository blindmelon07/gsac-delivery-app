<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'rider', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

// --- Access control ---

test('guest is redirected from customer dashboard', function () {
    $this->get('/customer/dashboard')->assertRedirect('/login');
});

test('admin cannot access customer dashboard', function () {
    $this->actingAs(userWithRole('admin'))
        ->get('/customer/dashboard')
        ->assertStatus(403);
});

test('rider cannot access customer shop', function () {
    $this->actingAs(userWithRole('rider'))
        ->get('/customer/shop')
        ->assertStatus(403);
});

// --- Dashboard ---

test('customer can view dashboard with stats', function () {
    $customer = userWithRole('customer');
    Order::factory()->count(2)->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->get('/customer/dashboard')
        ->assertInertia(fn ($page) =>
            $page->component('Customer/Dashboard')
                 ->has('stats')
                 ->has('recentOrders')
        );
});

// --- Shop ---

test('customer can view shop', function () {
    Product::factory()->count(5)->create();

    $this->actingAs(userWithRole('customer'))
        ->get('/customer/shop')
        ->assertInertia(fn ($page) =>
            $page->component('Customer/Shop')
                 ->has('products', 5)
                 ->has('categories')
        );
});

test('shop only returns active products', function () {
    Product::factory()->count(3)->create();
    Product::factory()->inactive()->count(2)->create();

    $this->actingAs(userWithRole('customer'))
        ->get('/customer/shop')
        ->assertInertia(fn ($page) =>
            $page->component('Customer/Shop')
                 ->has('products', 3)
        );
});

test('shop can be filtered by category', function () {
    Product::factory()->create(['category' => 'Seafood']);
    Product::factory()->create(['category' => 'Vegetables']);

    $this->actingAs(userWithRole('customer'))
        ->get('/customer/shop?category=Seafood')
        ->assertInertia(fn ($page) =>
            $page->component('Customer/Shop')
                 ->has('products', 1)
        );
});

// --- Place order ---

test('customer can place an order', function () {
    $customer = userWithRole('customer');
    $product = Product::factory()->create(['price' => 100.00]);

    $this->actingAs($customer)
        ->post('/customer/orders', [
            'delivery_address' => '123 Test Street, Manila',
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('orders', [
        'customer_id' => $customer->id,
        'total_amount' => 200.00,
        'status' => 'pending',
    ]);

    $this->assertDatabaseHas('order_items', [
        'product_id' => $product->id,
        'quantity' => 2,
        'subtotal' => 200.00,
    ]);
});

test('order requires delivery address', function () {
    $customer = userWithRole('customer');
    $product = Product::factory()->create();

    $this->actingAs($customer)
        ->post('/customer/orders', [
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ])
        ->assertSessionHasErrors('delivery_address');
});

test('order requires at least one item', function () {
    $this->actingAs(userWithRole('customer'))
        ->post('/customer/orders', [
            'delivery_address' => '123 Test St',
            'items' => [],
        ])
        ->assertSessionHasErrors('items');
});

// --- Cancel order ---

test('customer can cancel a pending order', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->pending()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->post("/customer/orders/{$order->id}/cancel")
        ->assertRedirect();

    expect($order->fresh()->status)->toBe('cancelled');
});

test('customer can cancel a confirmed order', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->confirmed()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->post("/customer/orders/{$order->id}/cancel");

    expect($order->fresh()->status)->toBe('cancelled');
});

test('customer cannot cancel a delivered order', function () {
    $customer = userWithRole('customer');
    $order = Order::factory()->delivered()->create(['customer_id' => $customer->id]);

    $this->actingAs($customer)
        ->post("/customer/orders/{$order->id}/cancel")
        ->assertStatus(422);

    expect($order->fresh()->status)->toBe('delivered');
});

test('customer cannot cancel another customers order', function () {
    $customer = userWithRole('customer');
    $other = userWithRole('customer');
    $order = Order::factory()->pending()->create(['customer_id' => $other->id]);

    $this->actingAs($customer)
        ->post("/customer/orders/{$order->id}/cancel")
        ->assertStatus(403);
});

// --- Orders list ---

test('customer sees only their own orders', function () {
    $customer = userWithRole('customer');
    $other = userWithRole('customer');

    Order::factory()->count(3)->create(['customer_id' => $customer->id]);
    Order::factory()->count(2)->create(['customer_id' => $other->id]);

    $this->actingAs($customer)
        ->get('/customer/orders')
        ->assertInertia(fn ($page) =>
            $page->component('Customer/Orders')
                 ->has('orders', 3)
        );
});

// --- Profile ---

test('customer can view profile', function () {
    $this->actingAs(userWithRole('customer'))
        ->get('/customer/profile')
        ->assertInertia(fn ($page) => $page->component('Customer/Profile'));
});

test('customer can update profile', function () {
    $customer = userWithRole('customer');

    $this->actingAs($customer)
        ->put('/customer/profile', [
            'name' => 'Updated Name',
            'phone' => '+63 912 345 6789',
            'address' => 'New Address, Quezon City',
        ]);

    expect($customer->fresh()->name)->toBe('Updated Name');
    expect($customer->fresh()->phone)->toBe('+63 912 345 6789');
});
