import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { StatusBadge } from '@/Components/ui/badge';
import { ShoppingBag, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

export default function Dashboard({ stats, recentOrders }) {
    const statCards = [
        { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, color: 'text-[#E8622A]' },
        { label: 'Pending', value: stats.pending_orders, icon: Clock, color: 'text-yellow-500' },
        { label: 'Delivered', value: stats.delivered_orders, icon: CheckCircle, color: 'text-green-500' },
        { label: 'Total Spent', value: `₱${Number(stats.total_spent).toFixed(2)}`, icon: DollarSign, color: 'text-blue-500' },
    ];

    return (
        <AppLayout title="My Dashboard">
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Icon className={`h-8 w-8 ${color}`} />
                                    <div>
                                        <p className="text-2xl font-bold text-[#1A100A]">{value}</p>
                                        <p className="text-xs text-gray-500">{label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Recent Orders</CardTitle>
                        <Link href="/customer/orders">
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No orders yet. Start shopping!</p>
                                <Link href="/customer/shop"><Button>Browse Products</Button></Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-[#1A100A]">Order #{order.id}</p>
                                            <p className="text-xs text-gray-500">{order.items?.length} item(s) • ₱{Number(order.total_amount).toFixed(2)}</p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
