import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "loading" | "error" | "empty";

interface StatePanelProps {
  variant: Variant;
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function StatePanel({ variant, title, message, icon, action }: StatePanelProps) {
  const isError = variant === "error";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-12 text-center",
        isError ? "text-destructive" : "text-muted-foreground",
      )}
      role={isError ? "alert" : "status"}
    >
      {variant === "loading" ? (
        <>
          <Loader2 className="size-6 animate-spin" />
          <p>Loading…</p>
        </>
      ) : (
        <>
          {icon}
          {title && <h2 className={cn("text-lg font-semibold", !isError && "text-foreground")}>{title}</h2>}
          {message && <p className="max-w-md text-sm">{message}</p>}
          {action}
        </>
      )}
    </div>
  );
}
