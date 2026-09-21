import type { ReactNode } from "react";

export function Alert({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "error" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-[var(--soft-green)] text-[var(--primary-dark)]"
      }`}
    >
      {children}
    </div>
  );
}

