import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { StatusBadge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

const STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function Orders({ orders, riders }) {
    function updateStatus(orderId, status) {
        router.patch(`/admin/orders/${orderId}/status`, { status });
    }

    function assignRider(orderId, rider_id) {
        router.patch(`/admin/orders/${orderId}/assign`, { rider_id });
    }

    function markPaid(orderId) {
        router.patch(`/admin/orders/${orderId}/mark-paid`);
    }

    return (
        <AppLayout title="Orders">
            <div className="space-y-4">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <CardTitle className="text-base">
                                        Order #{order.id} — {order.customer?.name}
                                    </CardTitle>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()} • ₱{Number(order.total_amount).toFixed(2)}
                                        {order.rider && ` • Rider: ${order.rider.name}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <StatusBadge status={order.status} />
                                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_method === 'cod' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {order.payment_method === 'cod' ? '💵 COD' : '📱 QR Ph'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status === 'failed' ? '✗ Failed' : 'Unpaid'}
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>

                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Status update */}
                                <Select onValueChange={v => updateStatus(order.id, v)} defaultValue={order.status}>
                                    <SelectTrigger className="w-44 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUSES.map(s => (
                                            <SelectItem key={s} value={s} className="text-xs capitalize">
                                                {s.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Assign rider */}
                                {!order.rider_id && riders.length > 0 && (
                                    <Select onValueChange={v => assignRider(order.id, v)}>
                                        <SelectTrigger className="w-44 h-8 text-xs">
                                            <SelectValue placeholder="Assign rider…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {riders.map(r => (
                                                <SelectItem key={r.id} value={String(r.id)} className="text-xs">{r.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Mark paid — for COD orders that are delivered but still unpaid */}
                                {order.payment_method === 'cod' && order.payment_status !== 'paid' && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 text-xs"
                                        onClick={() => markPaid(order.id)}
                                    >
                                        ✓ Mark Paid
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {orders.length === 0 && <div className="text-center py-16 text-gray-500">No orders yet.</div>}
            </div>
        </AppLayout>
    );
}
