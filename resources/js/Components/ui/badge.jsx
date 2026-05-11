import { cn } from '@/lib/utils';

const statusColors = {
    pending: 'bg-orange-100 text-orange-700',
    confirmed: 'bg-blue-100 text-blue-700',
    preparing: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

export function Badge({ className, variant = 'default', children, ...props }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                variant === 'status' && statusColors[children?.toLowerCase?.().replace(/ /g, '_')],
                variant === 'default' && 'bg-gray-100 text-gray-700',
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

export function StatusBadge({ status }) {
    const labels = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        preparing: 'Preparing',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };
    return (
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[status])}>
            {labels[status] || status}
        </span>
    );
}
