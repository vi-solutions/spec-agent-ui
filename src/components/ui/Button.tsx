import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "sm" | "md";
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium cursor-pointer " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes: Record<typeof size, string> = {
    sm: "!px-3 !py-1.5 !text-sm",
    md: "px-4 py-2 text-sm",
  };

  const variants: Record<Variant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500",
    secondary:
      "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus:ring-slate-400",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(base, variants[variant], className, sizes[size])}
    />
  );
}
