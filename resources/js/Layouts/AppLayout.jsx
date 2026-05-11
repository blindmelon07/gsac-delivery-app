import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, ShoppingBag, ClipboardList, User, Package,
    Users, Truck, History, DollarSign, Menu, X, LogOut, ChevronRight,
} from 'lucide-react';

const customerNav = [
    { label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard, route: 'customer.dashboard' },
    { label: 'Shop', href: '/customer/shop', icon: ShoppingBag, route: 'customer.shop' },
    { label: 'My Orders', href: '/customer/orders', icon: ClipboardList, route: 'customer.orders' },
    { label: 'Profile', href: '/customer/profile', icon: User, route: 'customer.profile' },
];

const adminNav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, route: 'admin.dashboard' },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList, route: 'admin.orders' },
    { label: 'Products', href: '/admin/products', icon: Package, route: 'admin.products.index' },
    { label: 'Users', href: '/admin/users', icon: Users, route: 'admin.users' },
];

const riderNav = [
    { label: 'Dashboard', href: '/rider/dashboard', icon: LayoutDashboard, route: 'rider.dashboard' },
    { label: 'Deliveries', href: '/rider/deliveries', icon: Truck, route: 'rider.deliveries' },
    { label: 'History', href: '/rider/history', icon: History, route: 'rider.history' },
    { label: 'Earnings', href: '/rider/earnings', icon: DollarSign, route: 'rider.earnings' },
];

function getSidebarConfig(roles) {
    if (roles?.includes('admin')) return { nav: adminNav, bg: 'bg-[#1A100A]', text: 'text-gray-300', active: 'bg-[#E8622A] text-white', logo: 'text-[#E8622A]' };
    if (roles?.includes('rider')) return { nav: riderNav, bg: 'bg-[#2A6E52]', text: 'text-green-100', active: 'bg-white text-[#2A6E52]', logo: 'text-white' };
    return { nav: customerNav, bg: 'bg-white', text: 'text-gray-600', active: 'bg-[#E8622A] text-white', logo: 'text-[#E8622A]', border: 'border-r border-gray-200' };
}

export default function AppLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const roles = auth?.user?.roles || [];
    const { nav, bg, text, active, logo, border = '' } = getSidebarConfig(roles);

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    function logout() {
        router.post('/logout');
    }

    const Sidebar = () => (
        <aside className={`flex flex-col h-full ${bg} ${border} w-64`}>
            <div className="p-6 flex items-center justify-between">
                <Link href="/" className={`text-2xl font-bold ${logo}`} style={{ fontFamily: 'Fraunces, serif' }}>
                    Gsac
                </Link>
                <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                    <X className={`h-5 w-5 ${text}`} />
                </button>
            </div>
            <nav className="flex-1 px-3 space-y-1">
                {nav.map((item) => {
                    const isActive = currentPath.startsWith(item.href);
                    return (
                        <Link
                            key={item.route}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? active : `${text} hover:bg-black/10`}`}
                        >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-black/10">
                <div className={`flex items-center gap-3 mb-3 ${text}`}>
                    <img src={auth?.user?.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{auth?.user?.name}</p>
                        <p className="text-xs opacity-70 truncate">{auth?.user?.email}</p>
                    </div>
                </div>
                <button onClick={logout} className={`flex items-center gap-2 text-sm ${text} hover:text-red-400 transition-colors`}>
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-[#FBF7F4] overflow-hidden">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex-shrink-0 z-50">
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                    <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5 text-gray-600" />
                    </button>
                    {title && <h1 className="text-lg font-semibold text-[#1A100A]" style={{ fontFamily: 'Fraunces, serif' }}>{title}</h1>}
                </header>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {flash.error}
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
