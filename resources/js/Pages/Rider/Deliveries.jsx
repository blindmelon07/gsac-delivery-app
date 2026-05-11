import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { StatusBadge } from '@/Components/ui/badge';

export default function Deliveries({ activeDeliveries, availableOrders }) {
    function accept(id) { router.post(`/rider/deliveries/${id}/accept`); }
    function pickup(id) { router.post(`/rider/deliveries/${id}/pickup`); }
    function deliver(id) { router.post(`/rider/deliveries/${id}/deliver`); }

    return (
        <AppLayout title="Deliveries">
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>My Active Deliveries ({activeDeliveries.length})</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-gray-100">
                        {activeDeliveries.map(order => (
                            <div key={order.id} className="py-3 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium">Order #{order.id}</p>
                                        <p className="text-xs text-gray-500">{order.customer?.name}</p>
                                        <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="flex gap-2">
                                    {order.status === 'out_for_delivery' && (
                                        <Button size="sm" onClick={() => pickup(order.id)}>Picked Up</Button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <Button size="sm" variant="secondary" onClick={() => deliver(order.id)}>Delivered</Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {activeDeliveries.length === 0 && <p className="text-sm text-gray-500 py-3">No active deliveries.</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Available to Accept ({availableOrders.length})</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-gray-100">
                        {availableOrders.map(order => (
                            <div key={order.id} className="py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">Order #{order.id} — {order.customer?.name}</p>
                                    <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                                    <p className="text-xs text-[#E8622A] font-medium">₱49 delivery fee</p>
                                </div>
                                <Button size="sm" onClick={() => accept(order.id)}>Accept</Button>
                            </div>
                        ))}
                        {availableOrders.length === 0 && <p className="text-sm text-gray-500 py-3">No available orders.</p>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
