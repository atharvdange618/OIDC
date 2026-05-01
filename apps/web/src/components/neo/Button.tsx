import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "cursor-pointer rounded-none border-4 border-black dark:border-gray-700 font-black font-sans " +
  "transition-all outline-none " +
  "shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] " +
  "hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] " +
  "focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:animate-[subtle-pulse_1.5s_ease-in-out_infinite] " +
  "disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#FF9149] dark:bg-secondary text-black dark:text-white " +
    "dark:shadow-[8px_8px_0px_0px_rgba(214,116,56,0.3)]",
  secondary:
    "bg-white dark:bg-neutral-900 text-black dark:text-white " +
    "hover:bg-[#E0FFF1] dark:hover:bg-neutral-800 " +
    "dark:shadow-[8px_8px_0px_0px_rgba(74,144,204,0.3)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-base",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "lg", type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
