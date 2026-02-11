"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const liquidButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        liquid:
          "bg-gradient-to-br from-pink-400/90 via-pink-500/90 to-rose-500/90 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border border-white/20",
        metal:
          "bg-gradient-to-br from-pink-300/80 via-rose-300/80 to-pink-400/80 text-pink-900 shadow-md shadow-pink-300/50 hover:shadow-lg hover:shadow-pink-300/60 hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm border border-white/30",
        glass:
          "bg-white/60 backdrop-blur-md text-pink-700 shadow-sm border border-pink-200/50 hover:bg-white/80 hover:shadow-md hover:border-pink-300/60 hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "text-pink-600 hover:bg-pink-50/50 hover:text-pink-700 backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "liquid",
      size: "default",
    },
  }
);

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean;
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(liquidButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {variant !== "ghost" && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Comp>
    );
  }
);
LiquidButton.displayName = "LiquidButton";

const MetalButton = React.forwardRef<
  HTMLButtonElement,
  Omit<LiquidButtonProps, "variant">
>((props, ref) => <LiquidButton ref={ref} variant="metal" {...props} />);
MetalButton.displayName = "MetalButton";

const GlassButton = React.forwardRef<
  HTMLButtonElement,
  Omit<LiquidButtonProps, "variant">
>((props, ref) => <LiquidButton ref={ref} variant="glass" {...props} />);
GlassButton.displayName = "GlassButton";

export { LiquidButton, MetalButton, GlassButton, liquidButtonVariants };
