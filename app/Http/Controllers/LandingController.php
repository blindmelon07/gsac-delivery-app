<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        $featuredProducts = Product::active()->featured()->limit(6)->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'price' => $p->price,
            'category' => $p->category,
            'unit' => $p->unit,
            'image_url' => $p->image_url,
        ]);

        return Inertia::render('Landing', [
            'featuredProducts' => $featuredProducts,
        ]);
    }
}
