import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
}

type ButtonProps = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size">;

function classes(variant: Variant, size: Size, fullWidth?: boolean, className?: string) {
  return cn(
    "btn focus-ring",
    variant === "primary" && "btn-primary",
    variant === "accent" && "btn-accent",
    variant === "outline" && "btn-outline",
    variant === "ghost" && "btn-ghost",
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg",
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={classes(variant, size, fullWidth, className)} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}

type LinkProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export function LinkButton({
  variant = "primary",
  size = "md",
  fullWidth,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: LinkProps) {
  return (
    <a className={classes(variant, size, fullWidth, className)} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </a>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
