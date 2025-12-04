import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        // New variants for Corpo Braindance theme
        gradient:
          'bg-linear-to from-[var(--color-gradient-primary-start)] to-[var(--color-gradient-primary-end)] hover:from-[var(--color-gradient-primary-start)] hover:to-[var(--color-gradient-primary-end)] text-white shadow-lg border border-indigo-400/50 active:scale-95',
        neural:
          'bg-neural-primary/20 hover:bg-neural-primary/30 text-neural-primary-light border border-neural-primary/50 shadow-neural font-mono uppercase tracking-wider',
        slate: 'bg-surface-overlay hover:bg-surface-overlay text-text-secondary border border-base active:scale-95',
        success:
          'bg-status-success hover:bg-status-success border border-status-success text-status-success font-semibold active:scale-95',
        danger: 'bg-status-error hover:bg-status-error border border-status-error text-status-error font-semibold active:scale-95',
        tab: 'relative px-6 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 border border-transparent',
        'tab-active': 'bg-neural-primary/20 text-neural-primary-light border border-neural-primary-hover/50 shadow-neural-accent',
        'tab-inactive': 'text-muted hover:text-neural-primary-hover hover:bg-surface-elevated/50 hover:border-neural-primary/20',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        xl: 'px-8 py-4 rounded-xl font-bold text-lg',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
