<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'rider', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
});

// --- Login ---

test('login page is accessible to guests', function () {
    $this->get('/login')->assertStatus(200);
});

test('register page is accessible to guests', function () {
    $this->get('/register')->assertStatus(200);
});

test('authenticated users are redirected away from login', function () {
    $user = userWithRole('customer');
    $this->actingAs($user)->get('/login')->assertRedirect();
});

test('login fails with wrong credentials', function () {
    User::factory()->create(['email' => 'test@example.com']);

    $this->post('/login', ['email' => 'test@example.com', 'password' => 'wrong'])
        ->assertSessionHasErrors('email');
});

test('customer is redirected to customer dashboard after login', function () {
    $user = userWithRole('customer');

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('customer.dashboard'));
});

test('admin is redirected to admin dashboard after login', function () {
    $user = userWithRole('admin');

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('admin.dashboard'));
});

test('rider is redirected to rider dashboard after login', function () {
    $user = userWithRole('rider');

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('rider.dashboard'));
});

// --- Register ---

test('can register as customer', function () {
    $this->post('/register', [
        'name' => 'Juan Customer',
        'email' => 'juan@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'customer',
    ])->assertRedirect(route('customer.dashboard'));

    $user = User::where('email', 'juan@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->hasRole('customer'))->toBeTrue();
});

test('can register as rider', function () {
    $this->post('/register', [
        'name' => 'Pedro Rider',
        'email' => 'pedro@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'rider',
    ])->assertRedirect(route('rider.dashboard'));

    expect(User::where('email', 'pedro@example.com')->first()->hasRole('rider'))->toBeTrue();
});

test('cannot register with invalid role', function () {
    $this->post('/register', [
        'name' => 'Evil Admin',
        'email' => 'evil@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'admin',
    ])->assertSessionHasErrors('role');
});

test('registration requires unique email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->post('/register', [
        'name' => 'Another User',
        'email' => 'taken@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role' => 'customer',
    ])->assertSessionHasErrors('email');
});

// --- Logout ---

test('authenticated user can logout', function () {
    $user = userWithRole('customer');

    $this->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/');

    $this->assertGuest();
});
