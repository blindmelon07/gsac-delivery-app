<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'customer_id' => User::factory(),
            'rider_id' => null,
            'status' => Order::STATUS_PENDING,
            'payment_status' => Order::PAYMENT_UNPAID,
            'total_amount' => fake()->randomFloat(2, 100, 2000),
            'delivery_fee' => 49.00,
            'delivery_address' => fake()->address(),
            'notes' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => Order::STATUS_PENDING]);
    }

    public function confirmed(): static
    {
        return $this->state(['status' => Order::STATUS_CONFIRMED]);
    }

    public function delivered(): static
    {
        return $this->state([
            'status' => Order::STATUS_DELIVERED,
            'payment_status' => Order::PAYMENT_PAID,
            'delivered_at' => now(),
        ]);
    }

    public function paid(): static
    {
        return $this->state(['payment_status' => Order::PAYMENT_PAID]);
    }
}
