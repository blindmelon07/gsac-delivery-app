import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent } from '@/Components/ui/card';
import { ShoppingCart, Plus, Minus, X, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import LocationPicker from '@/Components/LocationPicker';

export default function Shop({ products, categories, filters }) {
    const [cart, setCart] = useState([]);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const [activeCategory, setActiveCategory] = useState(filters?.category || '');
    const [location, setLocation] = useState({ address: '', lat: null, lng: null });

    const { data, setData, post, processing, errors } = useForm({
        delivery_address: '',
        delivery_lat: null,
        delivery_lng: null,
        payment_method: 'cod',
        notes: '',
        items: [],
    });

    function handleLocationChange(loc) {
        setLocation(loc);
        setData(d => ({
            ...d,
            delivery_address: loc.address,
            delivery_lat: loc.lat,
            delivery_lng: loc.lng,
        }));
    }

    function addToCart(product) {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { product_id: product.id, quantity: 1, name: product.name, price: product.price, unit: product.unit }];
        });
    }

    function updateQty(product_id, qty) {
        if (qty < 1) return removeFromCart(product_id);
        setCart(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: qty } : i));
    }

    function removeFromCart(product_id) {
        setCart(prev => prev.filter(i => i.product_id !== product_id));
    }

    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    function handleSearch(e) {
        e.preventDefault();
        router.get('/customer/shop', { search, category: activeCategory }, { preserveState: true });
    }

    function filterCategory(cat) {
        const newCat = activeCategory === cat ? '' : cat;
        setActiveCategory(newCat);
        router.get('/customer/shop', { category: newCat, search }, { preserveState: true });
    }

    function submitOrder(e) {
        e.preventDefault();
        post('/customer/orders', {
            data: {
                ...data,
                items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
            },
            onSuccess: () => { setCart([]); setCheckoutOpen(false); },
        });
    }

    return (
        <AppLayout title="Shop">
            <div className="space-y-4">
                {/* Search + filter */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input className="pl-9" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Button type="submit" variant="outline">Search</Button>
                </form>

                <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => filterCategory(cat)}
                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${activeCategory === cat ? 'bg-[#E8622A] text-white border-[#E8622A]' : 'border-gray-300 text-gray-600 hover:border-[#E8622A]'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => {
                        const cartItem = cart.find(i => i.product_id === product.id);
                        return (
                            <Card key={product.id} className="overflow-hidden">
                                <img src={product.image_url} alt={product.name} className="w-full h-36 object-cover" />
                                <CardContent className="p-3 space-y-2">
                                    <p className="text-xs text-[#E8622A] font-medium">{product.category}</p>
                                    <p className="text-sm font-semibold text-[#1A100A] line-clamp-2">{product.name}</p>
                                    <p className="text-sm font-bold text-[#E8622A]">₱{Number(product.price).toFixed(2)} / {product.unit}</p>
                                    <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                                    {cartItem ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQty(product.id, cartItem.quantity - 1)} className="h-7 w-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-sm font-medium w-6 text-center">{cartItem.quantity}</span>
                                            <button onClick={() => updateQty(product.id, cartItem.quantity + 1)} className="h-7 w-7 rounded-full bg-[#E8622A] text-white flex items-center justify-center hover:bg-[#c9521f]">
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Button size="sm" className="w-full" onClick={() => addToCart(product)} disabled={product.stock === 0}>
                                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No products found.</div>
                )}
            </div>

            {/* Floating cart button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setCheckoutOpen(true)}
                    className="fixed bottom-6 right-6 bg-[#E8622A] text-white rounded-full px-5 py-3 flex items-center gap-2 shadow-lg hover:bg-[#c9521f] transition-colors"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-medium">{cartCount} items • ₱{cartTotal.toFixed(2)}</span>
                </button>
            )}

            {/* Checkout dialog */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Checkout</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        {/* Cart items */}
                        <div className="divide-y divide-gray-100">
                            {cart.map(item => (
                                <div key={item.product_id} className="py-2 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{item.name}</p>
                                        <p className="text-xs text-gray-500">₱{Number(item.price).toFixed(2)} × {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">₱{(item.price * item.quantity).toFixed(2)}</p>
                                        <button onClick={() => removeFromCart(item.product_id)}>
                                            <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="flex justify-between text-sm font-semibold border-t pt-2">
                            <span>Subtotal</span><span>₱{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Delivery fee</span><span>₱49.00</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total</span><span className="text-[#E8622A]">₱{(cartTotal + 49).toFixed(2)}</span>
                        </div>

                        <form onSubmit={submitOrder} className="space-y-3">
                            {/* Google Maps location picker */}
                            <div className="space-y-1">
                                <Label>Delivery Location</Label>
                                <LocationPicker
                                    value={location}
                                    onChange={handleLocationChange}
                                />
                                {errors.delivery_address && (
                                    <p className="text-xs text-red-500">{errors.delivery_address}</p>
                                )}
                            </div>

                            {/* Payment method */}
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay the rider in cash', icon: '💵' },
                                        { value: 'qrph', label: 'QR Ph', desc: 'GCash, Maya, InstaPay', icon: '📱' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setData('payment_method', opt.value)}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-colors ${data.payment_method === opt.value ? 'border-[#E8622A] bg-[#E8622A]/5' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <span className="text-2xl">{opt.icon}</span>
                                            <span className={`text-xs font-semibold ${data.payment_method === opt.value ? 'text-[#E8622A]' : 'text-gray-700'}`}>{opt.label}</span>
                                            <span className="text-xs text-gray-400">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label>Notes (optional)</Label>
                                <Input
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    placeholder="Gate code, landmark, special instructions…"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || !data.delivery_address}
                            >
                                {processing
                                    ? 'Placing order…'
                                    : data.payment_method === 'cod'
                                        ? '💵 Place Order — Pay on Delivery'
                                        : '📱 Place Order — Pay via QR Ph'}
                            </Button>

                            {!data.delivery_address && (
                                <p className="text-xs text-center text-gray-400">
                                    Search or pin your delivery location to continue
                                </p>
                            )}
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
