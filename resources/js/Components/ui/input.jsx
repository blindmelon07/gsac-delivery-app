import { cn } from '@/lib/utils';

export function Input({ className, type = 'text', ...props }) {
    return (
        <input
            type={type}
            className={cn(
                'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
}
