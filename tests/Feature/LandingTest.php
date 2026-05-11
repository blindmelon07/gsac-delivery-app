<?php

use App\Models\Product;

test('landing page is publicly accessible', function () {
    $this->get('/')->assertStatus(200);
});

test('landing page contains featured products in inertia props', function () {
    Product::factory()->featured()->count(3)->create();
    Product::factory()->count(2)->create(); // non-featured

    $response = $this->get('/');

    $response->assertInertia(fn ($page) =>
        $page->component('Landing')
             ->has('featuredProducts', 3)
    );
});

test('landing page shows no featured products when none exist', function () {
    Product::factory()->count(2)->create(); // active but not featured

    $this->get('/')
        ->assertInertia(fn ($page) =>
            $page->component('Landing')
                 ->has('featuredProducts', 0)
        );
});

test('landing page only shows active featured products', function () {
    Product::factory()->featured()->create();
    Product::factory()->inactive()->state(['is_featured' => true])->create();

    $this->get('/')
        ->assertInertia(fn ($page) =>
            $page->component('Landing')
                 ->has('featuredProducts', 1)
        );
});
