import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md shadow-none text-sm font-medium ring-offset-background transition transform-gpu ease-in-out duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-95 group select-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:opacity-70 bt-primary cursor-pointer',
        destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 cursor-pointer',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer',
        secondary: 'btn-secondary cursor-pointer',
        tertiary: 'text-foreground bg-gray-700 hover:bg-gray-600 cursor-pointer',
        subtle: 'border border-input bg-accent/20 hover:bg-white/10 hover:text-accent-foreground cursor-pointer',
        ghost: 'hover:bg-accent hover:text-accent-foreground cursor-pointer',
        link: 'text-primary underline-offset-4 hover:underline cursor-pointer',
        white: 'bg-foreground text-background hover:opacity-70 cursor-pointer',
        cnc: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer',
        emergency: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border-2 border-red-500 cursor-pointer',
        success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 cursor-pointer',
        warning: 'bg-amber-600 text-white hover:bg-amber-700 active:bg-amber-800 cursor-pointer',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-10 px-8',
        xl: 'h-12 px-10',
        icon: 'h-8 w-8',
        iconlg: 'h-10 w-10',
        jog: 'h-9 w-9 p-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  iconl?: React.ReactNode;
  iconr?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ iconl, iconr, className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };