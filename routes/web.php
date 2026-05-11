<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboard;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Rider\DashboardController as RiderDashboard;
use App\Http\Controllers\Rider\DeliveryController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

// Public
Route::get('/', [LandingController::class, 'index'])->name('home');

// Webhook — no auth, CSRF excluded via bootstrap/app.php validateCsrfTokens
Route::post('/webhooks/paymongo', [WebhookController::class, 'paymongo'])
    ->name('webhooks.paymongo');

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout')->middleware('auth');

// Customer
Route::middleware(['auth', 'role:customer'])->prefix('customer')->name('customer.')->group(function () {
    Route::get('/dashboard', [CustomerDashboard::class, 'index'])->name('dashboard');
    Route::get('/shop', [CustomerDashboard::class, 'shop'])->name('shop');
    Route::get('/profile', [CustomerDashboard::class, 'profile'])->name('profile');
    Route::put('/profile', [CustomerDashboard::class, 'updateProfile'])->name('profile.update');
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('orders');
    Route::post('/orders', [CustomerOrderController::class, 'store'])->name('orders.store');
    Route::get('/orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
    Route::post('/orders/{order}/cancel', [CustomerOrderController::class, 'cancel'])->name('orders.cancel');

    // Payment
    Route::get('/orders/{order}/pay', [PaymentController::class, 'show'])->name('payment.show');
    Route::post('/orders/{order}/pay/initiate', [PaymentController::class, 'initiate'])->name('payment.initiate');
    Route::get('/orders/{order}/pay/status', [PaymentController::class, 'checkStatus'])->name('payment.status');
});

// Admin
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboard::class, 'index'])->name('dashboard');
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders');
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    Route::patch('/orders/{order}/assign', [AdminOrderController::class, 'assignRider'])->name('orders.assign');
    Route::patch('/orders/{order}/mark-paid', [AdminOrderController::class, 'markPaid'])->name('orders.mark-paid');
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::get('/users', [UserController::class, 'index'])->name('users');
    Route::patch('/users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle');
});

// Rider
Route::middleware(['auth', 'role:rider'])->prefix('rider')->name('rider.')->group(function () {
    Route::get('/dashboard', [RiderDashboard::class, 'index'])->name('dashboard');
    Route::get('/earnings', [RiderDashboard::class, 'earnings'])->name('earnings');
    Route::get('/deliveries', [DeliveryController::class, 'index'])->name('deliveries');
    Route::post('/deliveries/{order}/accept', [DeliveryController::class, 'accept'])->name('deliveries.accept');
    Route::post('/deliveries/{order}/pickup', [DeliveryController::class, 'pickup'])->name('deliveries.pickup');
    Route::post('/deliveries/{order}/deliver', [DeliveryController::class, 'deliver'])->name('deliveries.deliver');
    Route::get('/history', [DeliveryController::class, 'history'])->name('history');
});
