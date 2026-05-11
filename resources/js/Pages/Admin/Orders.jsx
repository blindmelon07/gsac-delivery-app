import { useState } from 'react';
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

    return (
        <AppLayout title="Orders">
            <div className="space-y-4">
                {orders.map(order => (
                    <Card key={order.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <CardTitle className="text-base">Order #{order.id} — {order.customer?.name}</CardTitle>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()} • ₱{Number(order.total_amount).toFixed(2)}
                                        {order.rider && ` • Rider: ${order.rider.name}`}
                                    </p>
                                </div>
                                <StatusBadge status={order.status} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                            <div className="flex flex-wrap gap-2 items-center">
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
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {orders.length === 0 && <div className="text-center py-16 text-gray-500">No orders yet.</div>}
            </div>
        </AppLayout>
    );
}
