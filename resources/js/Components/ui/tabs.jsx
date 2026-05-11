import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
    return (
        <TabsPrimitive.List
            className={cn('inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500', className)}
            {...props}
        />
    );
}

export function TabsTrigger({ className, ...props }) {
    return (
        <TabsPrimitive.Trigger
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-[#E8622A] data-[state=active]:shadow-sm',
                className
            )}
            {...props}
        />
    );
}

export function TabsContent({ className, ...props }) {
    return <TabsPrimitive.Content className={cn('mt-2 focus-visible:outline-none', className)} {...props} />;
}
