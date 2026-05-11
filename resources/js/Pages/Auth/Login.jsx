import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post('/login');
    }

    return (
        <GuestLayout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl" style={{ fontFamily: 'Fraunces, serif' }}>
                            Welcome back
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">Sign in to your Gsac account</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={e => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Signing in…' : 'Sign In'}
                            </Button>
                        </form>
                        <p className="text-center text-sm text-gray-500 mt-4">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[#E8622A] hover:underline font-medium">
                                Register
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    );
}
