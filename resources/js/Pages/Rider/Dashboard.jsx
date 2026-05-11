import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Truck, CheckCircle, DollarSign } from 'lucide-react';
import { StatusBadge } from '@/Components/ui/badge';
import DeliveryMap from '@/Components/DeliveryMap';

export default function Dashboard({ stats, activeDeliveries, availableOrders }) {
    function accept(orderId) { router.post(`/rider/deliveries/${orderId}/accept`); }
    function pickup(orderId) { router.post(`/rider/deliveries/${orderId}/pickup`); }
    function deliver(orderId) { router.post(`/rider/deliveries/${orderId}/deliver`); }

    return (
        <AppLayout title="Rider Dashboard">
            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Active Deliveries', value: stats.active_deliveries, icon: Truck, color: 'text-yellow-500' },
                        { label: 'Total Delivered', value: stats.total_delivered, icon: CheckCircle, color: 'text-green-500' },
                        { label: "Today's Earnings", value: `₱${Number(stats.today_earnings).toFixed(2)}`, icon: DollarSign, color: 'text-[#E8622A]' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-5">
                                <Icon className={`h-6 w-6 ${color} mb-1`} />
                                <p className="text-xl font-bold">{value}</p>
                                <p className="text-xs text-gray-500">{label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Active deliveries with maps */}
                {activeDeliveries.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Active Deliveries</CardTitle></CardHeader>
                        <CardContent className="divide-y divide-gray-100">
                            {activeDeliveries.map(order => (
                                <div key={order.id} className="py-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-[#1A100A]">
                                                Order #{order.id} — {order.customer?.name}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>

                                    <DeliveryMap
                                        lat={order.delivery_latitude}
                                        lng={order.delivery_longitude}
                                        address={order.delivery_address}
                                        orderId={order.id}
                                    />

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
                        </CardContent>
                    </Card>
                )}

                {/* Available orders with map preview */}
                {availableOrders.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Available Orders</CardTitle></CardHeader>
                        <CardContent className="divide-y divide-gray-100">
                            {availableOrders.map(order => (
                                <div key={order.id} className="py-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-semibold text-[#1A100A]">
                                                Order #{order.id} — {order.customer?.name}
                                            </p>
                                            <p className="text-xs text-[#E8622A] font-medium">₱49 delivery fee</p>
                                        </div>
                                        <Button size="sm" onClick={() => accept(order.id)}>Accept</Button>
                                    </div>

                                    <DeliveryMap
                                        lat={order.delivery_latitude}
                                        lng={order.delivery_longitude}
                                        address={order.delivery_address}
                                        orderId={order.id}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {activeDeliveries.length === 0 && availableOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">No deliveries available right now.</div>
                )}
            </div>
        </AppLayout>
    );
}
