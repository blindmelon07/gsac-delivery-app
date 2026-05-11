import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-[#E8622A] text-white hover:bg-[#c9521f] focus-visible:ring-[#E8622A]',
                secondary: 'bg-[#2A6E52] text-white hover:bg-[#1f5540] focus-visible:ring-[#2A6E52]',
                outline: 'border border-[#E8622A] text-[#E8622A] bg-transparent hover:bg-[#E8622A] hover:text-white',
                ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
                destructive: 'bg-red-600 text-white hover:bg-red-700',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-12 rounded-md px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: { variant: 'default', size: 'default' },
    }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
