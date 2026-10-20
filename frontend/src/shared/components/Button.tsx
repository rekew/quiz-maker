import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "ghost", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`btn ${variant} ${className}`.trim()} {...props} />;
}
