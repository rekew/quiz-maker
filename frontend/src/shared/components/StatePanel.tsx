import type { ReactNode } from "react";

type Variant = "loading" | "error" | "empty";

interface StatePanelProps {
  variant: Variant;
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function StatePanel({ variant, title, message, icon, action }: StatePanelProps) {
  if (variant === "loading") {
    return (
      <div className="state-panel" role="status">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className={variant === "error" ? "state-panel error" : "state-panel empty"}
      role={variant === "error" ? "alert" : "status"}
    >
      {icon}
      {title && <h2>{title}</h2>}
      {message && <p className="muted">{message}</p>}
      {action}
    </div>
  );
}
