import type { ComponentProps } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";

type Variant = "primary" | "ghost" | "danger" | "outline" | "secondary";

const variantMap = {
  primary: "default",
  ghost: "ghost",
  danger: "destructive",
  outline: "outline",
  secondary: "secondary",
} as const;

interface ButtonProps extends Omit<ComponentProps<typeof ShadcnButton>, "variant"> {
  variant?: Variant;
}

export function Button({ variant = "ghost", asChild, type, size = "lg", ...props }: ButtonProps) {
  return (
    <ShadcnButton
      asChild={asChild}
      type={asChild ? undefined : (type ?? "button")}
      size={size}
      variant={variantMap[variant]}
      {...props}
    />
  );
}
