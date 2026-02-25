import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-orange-200 via-orange-400 to-orange-500 text-zinc-900 font-semibold rounded-full shadow-md shadow-orange-500/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/25 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm rounded-full hover:bg-destructive/90",
        outline:
          "border border-zinc-300 text-zinc-600 rounded-full bg-white hover:bg-zinc-50 hover:text-zinc-900",
        secondary:
          "bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200 hover:bg-zinc-200 hover:text-zinc-900",
        ghost:
          "rounded-lg hover:bg-zinc-50 hover:text-zinc-900",
        link: "text-orange-500 underline-offset-4 hover:underline hover:text-orange-600",
      },
      size: {
        default: "min-h-9 px-5 py-2",
        sm: "min-h-8 rounded-full px-3 text-xs",
        lg: "min-h-10 rounded-full px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
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
