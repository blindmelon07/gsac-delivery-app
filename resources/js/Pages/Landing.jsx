import { Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { ShoppingBag, Truck, Shield, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Landing({ featuredProducts = [] }) {
    return (
        <GuestLayout>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[#FBF7F4] to-[#f5ece4] py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold text-[#1A100A] mb-6" style={{ fontFamily: 'Fraunces, serif' }}>
                        Fresh Market Goods,
                        <span className="text-[#E8622A]"> Delivered to You</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Order fresh seafood, vegetables, fruits and more from local markets in the Philippines.
                        Fast, reliable delivery right to your doorstep.
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link href="/register">
                            <Button size="lg">Start Shopping</Button>
                        </Link>
                        <Link href="/login">
                            <Button size="lg" variant="outline">Sign In</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-6 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: ShoppingBag, title: 'Wide Selection', desc: 'Seafood, vegetables, fruits, poultry, and more from trusted local markets.' },
                        { icon: Truck, title: 'Fast Delivery', desc: 'Real-time order tracking with dedicated riders for your area.' },
                        { icon: Shield, title: 'Secure & Fresh', desc: 'Quality guaranteed — only the freshest goods from market to door.' },
                    ].map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="text-center p-6 rounded-xl bg-white shadow-sm border border-gray-100">
                            <div className="w-12 h-12 bg-[#E8622A]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Icon className="h-6 w-6 text-[#E8622A]" />
                            </div>
                            <h3 className="font-semibold text-[#1A100A] mb-2">{title}</h3>
                            <p className="text-sm text-gray-500">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="py-16 px-6 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-bold text-[#1A100A] mb-8 text-center" style={{ fontFamily: 'Fraunces, serif' }}>
                            Featured Products
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {featuredProducts.map((product) => (
                                <div key={product.id} className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
                                    <div className="p-4">
                                        <p className="text-xs text-[#E8622A] font-medium mb-1">{product.category}</p>
                                        <h3 className="font-semibold text-[#1A100A] text-sm">{product.name}</h3>
                                        <p className="text-[#E8622A] font-bold mt-1">₱{Number(product.price).toFixed(2)} / {product.unit}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <Link href="/register">
                                <Button>Shop All Products</Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-[#1A100A] mb-8" style={{ fontFamily: 'Fraunces, serif' }}>
                        What Our Customers Say
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { name: 'Maria Santos', text: 'Super fresh talaga! The seafood arrived so quickly and in perfect condition.' },
                            { name: 'Juan dela Cruz', text: 'Best delivery app for fresh produce. I order every week for my family.' },
                            { name: 'Ana Reyes', text: 'Ang ganda ng service! Reliable riders and always on time.' },
                        ].map(({ name, text }) => (
                            <div key={name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex gap-0.5 mb-3">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#E8622A] text-[#E8622A]" />)}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">"{text}"</p>
                                <p className="text-sm font-semibold text-[#1A100A]">{name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
