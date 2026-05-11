import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export default function Users({ users }) {
    function toggleActive(id) {
        router.patch(`/admin/users/${id}/toggle-active`);
    }

    const customers = users.filter(u => u.role === 'customer');
    const riders = users.filter(u => u.role === 'rider');

    return (
        <AppLayout title="Users">
            <div className="space-y-6">
                {[{ title: 'Customers', data: customers }, { title: 'Riders', data: riders }].map(({ title, data }) => (
                    <Card key={title}>
                        <CardHeader><CardTitle>{title} ({data.length})</CardTitle></CardHeader>
                        <CardContent>
                            <div className="divide-y divide-gray-100">
                                {data.map(user => (
                                    <div key={user.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                                            <div>
                                                <p className="text-sm font-medium text-[#1A100A]">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}{user.phone ? ` • ${user.phone}` : ''}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant={user.is_active ? 'destructive' : 'secondary'}
                                                onClick={() => toggleActive(user.id)}
                                            >
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {data.length === 0 && <p className="text-sm text-gray-500 py-4">No {title.toLowerCase()} yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppLayout>
    );
}
