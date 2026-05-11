import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { StatusBadge } from '@/Components/ui/badge';
import DeliveryMap from '@/Components/DeliveryMap';

export default function Deliveries({ activeDeliveries, availableOrders }) {
    function accept(id) { router.post(`/rider/deliveries/${id}/accept`); }
    function pickup(id) { router.post(`/rider/deliveries/${id}/pickup`); }
    function deliver(id) { router.post(`/rider/deliveries/${id}/deliver`); }

    return (
        <AppLayout title="Deliveries">
            <div className="space-y-6">
                {/* Active deliveries */}
                <Card>
                    <CardHeader>
                        <CardTitle>My Active Deliveries ({activeDeliveries.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-gray-100">
                        {activeDeliveries.map(order => (
                            <div key={order.id} className="py-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-[#1A100A]">Order #{order.id}</p>
                                        <p className="text-xs text-gray-500">{order.customer?.name}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                {/* Delivery map */}
                                <DeliveryMap
                                    lat={order.delivery_latitude}
                                    lng={order.delivery_longitude}
                                    address={order.delivery_address}
                                    orderId={order.id}
                                />

                                {/* Action buttons */}
                                <div className="flex gap-2">
                                    {order.status === 'out_for_delivery' && (
                                        <Button size="sm" onClick={() => pickup(order.id)} className="flex-1">
                                            Mark Picked Up
                                        </Button>
                                    )}
                                    {order.status === 'preparing' && (
                                        <Button size="sm" variant="secondary" onClick={() => deliver(order.id)} className="flex-1">
                                            Mark Delivered ✓
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {activeDeliveries.length === 0 && (
                            <p className="text-sm text-gray-500 py-4">No active deliveries.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Available to accept */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available to Accept ({availableOrders.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-gray-100">
                        {availableOrders.map(order => (
                            <div key={order.id} className="py-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-[#1A100A]">Order #{order.id}</p>
                                        <p className="text-xs text-gray-500">{order.customer?.name}</p>
                                        <p className="text-xs text-[#E8622A] font-medium mt-0.5">₱49 delivery fee</p>
                                    </div>
                                    <Button size="sm" onClick={() => accept(order.id)}>Accept</Button>
                                </div>

                                {/* Preview map for available orders */}
                                <DeliveryMap
                                    lat={order.delivery_latitude}
                                    lng={order.delivery_longitude}
                                    address={order.delivery_address}
                                    orderId={order.id}
                                />
                            </div>
                        ))}
                        {availableOrders.length === 0 && (
                            <p className="text-sm text-gray-500 py-4">No available orders.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
