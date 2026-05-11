import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function History({ deliveries }) {
    return (
        <AppLayout title="Delivery History">
            <Card>
                <CardHeader><CardTitle>Completed Deliveries ({deliveries.length})</CardTitle></CardHeader>
                <CardContent className="divide-y divide-gray-100">
                    {deliveries.map(order => (
                        <div key={order.id} className="py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Order #{order.id} — {order.customer?.name}</p>
                                <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                                <p className="text-xs text-gray-400">
                                    Delivered: {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString('en-PH') : '—'}
                                </p>
                            </div>
                            <p className="text-sm font-semibold text-[#2A6E52]">₱49.00</p>
                        </div>
                    ))}
                    {deliveries.length === 0 && <p className="text-sm text-gray-500 py-4">No completed deliveries yet.</p>}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
