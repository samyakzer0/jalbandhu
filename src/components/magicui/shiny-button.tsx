"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

const animationProps = {
  initial: { "--x": "100%", scale: 0.8 },
  animate: { "--x": "-100%", scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as any;

interface ShinyButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const ShinyButton = React.forwardRef<
  HTMLButtonElement,
  ShinyButtonProps
>(({ children, className, disabled, variant = 'default', size = 'md', ...props }, ref) => {
  
  // Size variants
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // Color variants
  const variantClasses = {
    default: {
      bg: 'bg-blue-600/20 hover:bg-blue-600/30',
      border: 'border-blue-500/30 hover:border-blue-400/50',
      text: 'text-blue-700 dark:text-blue-300',
      shadow: 'hover:shadow-blue-500/25',
      primary: '#3b82f6' // blue-500
    },
    danger: {
      bg: 'bg-red-600/20 hover:bg-red-600/30',
      border: 'border-red-500/30 hover:border-red-400/50', 
      text: 'text-red-700 dark:text-red-300',
      shadow: 'hover:shadow-red-500/25',
      primary: '#ef4444' // red-500
    }
  };

  const currentVariant = variantClasses[variant];

  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative cursor-pointer rounded-xl font-semibold backdrop-blur-xl border transition-all duration-300 ease-in-out hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]",
        sizeClasses[size],
        currentVariant.bg,
        currentVariant.border,
        currentVariant.text,
        currentVariant.shadow,
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
        className,
      )}
      {...animationProps}
      {...props}
      disabled={disabled}
      style={{
        '--primary': currentVariant.primary,
      } as React.CSSProperties}
    >
      <span
        className="relative block w-full h-full font-semibold flex items-center justify-center gap-2"
        style={{
          maskImage:
            "linear-gradient(-75deg,var(--primary) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),var(--primary) calc(var(--x) + 100%))",
        }}
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          WebkitMask:
            "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          backgroundImage:
            "linear-gradient(-75deg,var(--primary)/20% calc(var(--x)+20%),var(--primary)/80% calc(var(--x)+25%),var(--primary)/20% calc(var(--x)+100%))",
        }}
        className="absolute inset-0 z-10 block rounded-[inherit] p-px"
      />
    </motion.button>
  );
});

ShinyButton.displayName = "ShinyButton";