<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'customer']);
        Role::firstOrCreate(['name' => 'rider']);

        // Admin
        $admin = User::firstOrCreate(['email' => 'admin@gsac.ph'], [
            'name' => 'GSAC Admin',
            'password' => Hash::make('admin123'),
            'phone' => '+63 900 000 0001',
            'address' => 'Makati City, Metro Manila',
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        // Customer
        $customer = User::firstOrCreate(['email' => 'customer@gsac.ph'], [
            'name' => 'Juan dela Cruz',
            'password' => Hash::make('123456'),
            'phone' => '+63 917 123 4567',
            'address' => 'Quezon City, Metro Manila',
            'is_active' => true,
        ]);
        $customer->assignRole('customer');

        // Rider
        $rider = User::firstOrCreate(['email' => 'rider@gsac.ph'], [
            'name' => 'Pedro Reyes',
            'password' => Hash::make('rider123'),
            'phone' => '+63 918 987 6543',
            'address' => 'Pasig City, Metro Manila',
            'is_active' => true,
        ]);
        $rider->assignRole('rider');

        // Products
        $products = [
            ['name' => 'Fresh Bangus (Milkfish)', 'category' => 'Seafood', 'price' => 180.00, 'unit' => 'kg', 'stock' => 50, 'is_featured' => true, 'description' => 'Fresh bangus from local fish pens.'],
            ['name' => 'Tiger Prawns', 'category' => 'Seafood', 'price' => 450.00, 'unit' => 'kg', 'stock' => 30, 'is_featured' => true, 'description' => 'Large tiger prawns, fresh catch.'],
            ['name' => 'Pechay (Bok Choy)', 'category' => 'Vegetables', 'price' => 45.00, 'unit' => 'bundle', 'stock' => 100, 'is_featured' => true, 'description' => 'Fresh green pechay.'],
            ['name' => 'Sitaw (String Beans)', 'category' => 'Vegetables', 'price' => 60.00, 'unit' => 'bundle', 'stock' => 80, 'description' => 'Crisp string beans.'],
            ['name' => 'Carabao Mango', 'category' => 'Fruits', 'price' => 120.00, 'unit' => 'kg', 'stock' => 60, 'is_featured' => true, 'description' => 'Sweet Guimaras mangoes.'],
            ['name' => 'Saba Banana', 'category' => 'Fruits', 'price' => 80.00, 'unit' => 'bunch', 'stock' => 40, 'description' => 'Ripe saba for cooking.'],
            ['name' => 'Native Chicken', 'category' => 'Poultry', 'price' => 350.00, 'unit' => 'kg', 'stock' => 25, 'is_featured' => true, 'description' => 'Free-range native chicken.'],
            ['name' => 'Duck Eggs (Itlog ng Pato)', 'category' => 'Poultry', 'price' => 12.00, 'unit' => 'piece', 'stock' => 200, 'description' => 'Farm-fresh duck eggs.'],
            ['name' => 'Liempo (Pork Belly)', 'category' => 'Meat', 'price' => 280.00, 'unit' => 'kg', 'stock' => 45, 'description' => 'Fresh pork belly cuts.'],
            ['name' => 'White Rice', 'category' => 'Grains', 'price' => 65.00, 'unit' => 'kg', 'stock' => 200, 'description' => 'Premium jasmine white rice.'],
        ];

        foreach ($products as $productData) {
            Product::firstOrCreate(
                ['name' => $productData['name']],
                array_merge($productData, ['is_active' => true, 'is_featured' => $productData['is_featured'] ?? false])
            );
        }

        // Demo orders
        $product1 = Product::where('name', 'Fresh Bangus (Milkfish)')->first();
        $product2 = Product::where('name', 'Pechay (Bok Choy)')->first();

        if ($product1 && $product2 && Order::count() === 0) {
            $order = Order::create([
                'customer_id' => $customer->id,
                'status' => 'delivered',
                'total_amount' => 225.00,
                'delivery_fee' => 49.00,
                'delivery_address' => 'Quezon City, Metro Manila',
                'rider_id' => $rider->id,
                'delivered_at' => now()->subDay(),
            ]);
            OrderItem::create(['order_id' => $order->id, 'product_id' => $product1->id, 'quantity' => 1, 'unit_price' => 180.00, 'subtotal' => 180.00]);
            OrderItem::create(['order_id' => $order->id, 'product_id' => $product2->id, 'quantity' => 1, 'unit_price' => 45.00, 'subtotal' => 45.00]);

            $order2 = Order::create([
                'customer_id' => $customer->id,
                'status' => 'pending',
                'total_amount' => 180.00,
                'delivery_fee' => 49.00,
                'delivery_address' => 'Quezon City, Metro Manila',
            ]);
            OrderItem::create(['order_id' => $order2->id, 'product_id' => $product1->id, 'quantity' => 1, 'unit_price' => 180.00, 'subtotal' => 180.00]);
        }
    }
}
