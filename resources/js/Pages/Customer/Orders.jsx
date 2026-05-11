import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { StatusBadge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

export default function Orders({ orders }) {
    function cancel(orderId) {
        if (confirm('Cancel this order?')) {
            router.post(`/customer/orders/${orderId}/cancel`);
        }
    }

    return (
        <AppLayout title="My Orders">
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">No orders yet.</div>
                ) : (
                    orders.map(order => (
                        <Card key={order.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Order #{order.id}</CardTitle>
                                    <StatusBadge status={order.status} />
                                </div>
                                <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="divide-y divide-gray-100">
                                    {order.items?.map(item => (
                                        <div key={item.id} className="py-2 flex justify-between text-sm">
                                            <span>{item.product?.name} × {item.quantity}</span>
                                            <span className="font-medium">₱{Number(item.subtotal).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                                    <span>Total (incl. ₱49 delivery)</span>
                                    <span className="text-[#E8622A]">₱{(Number(order.total_amount) + 49).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_method === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '📱 QR Ph'}
                                    </span>
                                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status === 'failed' ? '✗ Failed' : 'Unpaid'}
                                    </span>
                                </div>
                                {order.delivery_address && (
                                    <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                                )}
                                {['pending', 'confirmed'].includes(order.status) && (
                                    <Button variant="destructive" size="sm" onClick={() => cancel(order.id)}>
                                        Cancel Order
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </AppLayout>
    );
}
