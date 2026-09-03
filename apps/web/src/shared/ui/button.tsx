import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/shared/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-label-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-brand-blue to-brand-blue-hover text-white shadow-sm shadow-brand-blue/20 hover:shadow-md hover:shadow-brand-blue/30 hover:brightness-110 active:brightness-95",
        secondary:
          "bg-transparent border border-primary-container/18 text-primary-container hover:bg-primary-container/5",
        destructive:
          "bg-danger/10 text-danger hover:bg-danger/15",
        ghost: "bg-transparent hover:bg-surface-container text-on-surface-variant",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-body-sm",
        icon: "h-7 w-7 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
