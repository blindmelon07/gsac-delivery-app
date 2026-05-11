<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 20, 500),
            'category' => fake()->randomElement(Product::$categories),
            'unit' => fake()->randomElement(['kg', 'bundle', 'piece', 'bag']),
            'stock' => fake()->numberBetween(10, 100),
            'is_active' => true,
            'is_featured' => false,
        ];
    }

    public function featured(): static
    {
        return $this->state(['is_featured' => true]);
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
