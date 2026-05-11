<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'rider', 'guard_name' => 'web']);
});

// --- Access control ---

test('guest cannot access admin dashboard', function () {
    $this->get('/admin/dashboard')->assertRedirect('/login');
});

test('customer cannot access admin dashboard', function () {
    $this->actingAs(userWithRole('customer'))
        ->get('/admin/dashboard')
        ->assertStatus(403);
});

// --- Dashboard ---

test('admin can view dashboard', function () {
    $this->actingAs(userWithRole('admin'))
        ->get('/admin/dashboard')
        ->assertInertia(fn ($page) =>
            $page->component('Admin/Dashboard')
                 ->has('stats')
                 ->has('recentOrders')
        );
});

// --- Orders ---

test('admin can view all orders', function () {
    $customer = userWithRole('customer');
    Order::factory()->count(3)->create(['customer_id' => $customer->id]);

    $this->actingAs(userWithRole('admin'))
        ->get('/admin/orders')
        ->assertInertia(fn ($page) =>
            $page->component('Admin/Orders')
                 ->has('orders', 3)
        );
});

test('admin can update order status', function () {
    $order = Order::factory()->pending()->create([
        'customer_id' => userWithRole('customer')->id,
    ]);

    $this->actingAs(userWithRole('admin'))
        ->patch("/admin/orders/{$order->id}/status", ['status' => 'confirmed']);

    expect($order->fresh()->status)->toBe('confirmed');
});

test('admin cannot set an invalid order status', function () {
    $order = Order::factory()->pending()->create([
        'customer_id' => userWithRole('customer')->id,
    ]);

    $this->actingAs(userWithRole('admin'))
        ->patch("/admin/orders/{$order->id}/status", ['status' => 'flying'])
        ->assertSessionHasErrors('status');
});

test('admin can assign a rider to an order', function () {
    $customer = userWithRole('customer');
    $rider = userWithRole('rider');
    $order = Order::factory()->confirmed()->create(['customer_id' => $customer->id]);

    $this->actingAs(userWithRole('admin'))
        ->patch("/admin/orders/{$order->id}/assign", ['rider_id' => $rider->id]);

    $order->refresh();
    expect($order->rider_id)->toBe($rider->id);
    expect($order->status)->toBe('out_for_delivery');
});

// --- Products ---

test('admin can view products', function () {
    Product::factory()->count(4)->create();

    $this->actingAs(userWithRole('admin'))
        ->get('/admin/products')
        ->assertInertia(fn ($page) =>
            $page->component('Admin/Products')
                 ->has('products', 4)
        );
});

test('admin can create a product', function () {
    $this->actingAs(userWithRole('admin'))
        ->post('/admin/products', [
            'name' => 'Fresh Tilapia',
            'price' => 150.00,
            'category' => 'Seafood',
            'unit' => 'kg',
            'stock' => 50,
            'is_active' => true,
            'is_featured' => false,
        ]);

    $this->assertDatabaseHas('products', ['name' => 'Fresh Tilapia', 'price' => 150.00]);
});

test('admin cannot create product without required fields', function () {
    $this->actingAs(userWithRole('admin'))
        ->post('/admin/products', ['name' => 'Incomplete'])
        ->assertSessionHasErrors(['price', 'category', 'unit', 'stock']);
});

test('admin can update a product', function () {
    $product = Product::factory()->create(['price' => 100.00]);

    $this->actingAs(userWithRole('admin'))
        ->put("/admin/products/{$product->id}", [
            'name' => $product->name,
            'price' => 200.00,
            'category' => $product->category,
            'unit' => $product->unit,
            'stock' => $product->stock,
            'is_active' => true,
            'is_featured' => false,
        ]);

    expect($product->fresh()->price)->toBe('200.00');
});

test('admin can delete a product', function () {
    $product = Product::factory()->create();

    $this->actingAs(userWithRole('admin'))
        ->delete("/admin/products/{$product->id}");

    $this->assertDatabaseMissing('products', ['id' => $product->id]);
});

// --- Users ---

test('admin can view users', function () {
    userWithRole('customer');
    userWithRole('rider');

    $this->actingAs(userWithRole('admin'))
        ->get('/admin/users')
        ->assertInertia(fn ($page) => $page->component('Admin/Users'));
});

test('admin can deactivate a user', function () {
    $customer = userWithRole('customer');
    expect($customer->is_active)->toBeTrue();

    $this->actingAs(userWithRole('admin'))
        ->patch("/admin/users/{$customer->id}/toggle-active");

    expect($customer->fresh()->is_active)->toBeFalse();
});

test('admin can reactivate a user', function () {
    $customer = userWithRole('customer', ['is_active' => false]);

    $this->actingAs(userWithRole('admin'))
        ->patch("/admin/users/{$customer->id}/toggle-active");

    expect($customer->fresh()->is_active)->toBeTrue();
});
