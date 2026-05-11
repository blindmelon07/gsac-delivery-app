import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { StatusBadge } from '@/Components/ui/badge';
import { ShoppingBag, DollarSign, Package, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ stats, recentOrders, revenueByDay }) {
    const statCards = [
        { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, color: 'text-[#E8622A]' },
        { label: 'Revenue', value: `₱${Number(stats.total_revenue).toLocaleString()}`, icon: DollarSign, color: 'text-green-500' },
        { label: 'Products', value: stats.total_products, icon: Package, color: 'text-blue-500' },
        { label: 'Customers', value: stats.total_customers, icon: Users, color: 'text-purple-500' },
    ];

    return (
        <AppLayout title="Admin Dashboard">
            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map(({ label, value, icon: Icon, color }) => (
                        <Card key={label}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3">
                                    <Icon className={`h-8 w-8 ${color}`} />
                                    <div>
                                        <p className="text-xl font-bold text-[#1A100A]">{value}</p>
                                        <p className="text-xs text-gray-500">{label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {revenueByDay.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Revenue (Last 30 Days)</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={revenueByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => `₱${Number(v).toFixed(2)}`} />
                                    <Line type="monotone" dataKey="revenue" stroke="#E8622A" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
                    <CardContent>
                        <div className="divide-y divide-gray-100">
                            {recentOrders.map(order => (
                                <div key={order.id} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Order #{order.id} — {order.customer?.name}</p>
                                        <p className="text-xs text-gray-500">₱{Number(order.total_amount).toFixed(2)}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
