import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#FBF7F4]">
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#E8622A]" style={{ fontFamily: 'Fraunces, serif' }}>
                        Gsac
                    </span>
                    <span className="text-sm text-[#6B3D1E] font-medium">Delivery</span>
                </Link>
                <nav className="flex items-center gap-4">
                    <Link href="/login" className="text-sm text-gray-600 hover:text-[#E8622A] transition-colors">
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="text-sm bg-[#E8622A] text-white px-4 py-2 rounded-lg hover:bg-[#c9521f] transition-colors"
                    >
                        Register
                    </Link>
                </nav>
            </header>
            <main>{children}</main>
            <footer className="bg-[#1A100A] text-gray-400 text-center text-sm py-6 mt-16">
                © {new Date().getFullYear()} Gsac Delivery. Fresh market goods delivered to your door.
            </footer>
        </div>
    );
}
