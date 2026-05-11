import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Profile({ user }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
    });

    function submit(e) {
        e.preventDefault();
        put('/customer/profile');
    }

    return (
        <AppLayout title="My Profile">
            <div className="max-w-lg">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <img src={user.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                            <div>
                                <CardTitle>{user.name}</CardTitle>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} placeholder="+63 9XX XXX XXXX" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Default Delivery Address</Label>
                                <Input id="address" value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Full address" />
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
