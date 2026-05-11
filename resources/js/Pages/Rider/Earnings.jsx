import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Earnings({ earningsByDay, totalEarnings }) {
    return (
        <AppLayout title="Earnings">
            <div className="space-y-6">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-3xl font-bold text-[#2A6E52]">₱{Number(totalEarnings).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Total Earnings</p>
                    </CardContent>
                </Card>

                {earningsByDay.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Daily Earnings</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={earningsByDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(v) => `₱${Number(v).toFixed(2)}`} />
                                    <Bar dataKey="earnings" fill="#2A6E52" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader><CardTitle>Daily Breakdown</CardTitle></CardHeader>
                    <CardContent className="divide-y divide-gray-100">
                        {earningsByDay.map(day => (
                            <div key={day.date} className="py-2 flex justify-between text-sm">
                                <span className="text-gray-600">{day.date}</span>
                                <span className="font-medium">{day.deliveries} deliveries — <span className="text-[#2A6E52] font-bold">₱{Number(day.earnings).toFixed(2)}</span></span>
                            </div>
                        ))}
                        {earningsByDay.length === 0 && <p className="text-sm text-gray-500 py-4">No earnings yet.</p>}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
