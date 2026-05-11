import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
    });

    function submit(e) {
        e.preventDefault();
        post('/register');
    }

    return (
        <GuestLayout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl" style={{ fontFamily: 'Fraunces, serif' }}>
                            Create an account
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Join Gsac Delivery today</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Juan dela Cruz" />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="you@example.com" />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} placeholder="••••••••" />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label>I am a…</Label>
                                <div className="flex gap-3">
                                    {['customer', 'rider'].map(r => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setData('role', r)}
                                            className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${data.role === r ? 'border-[#E8622A] bg-[#E8622A]/10 text-[#E8622A]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Creating account…' : 'Create Account'}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#E8622A] hover:underline font-medium">
                                Sign in
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
