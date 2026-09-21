import type { ReactNode } from "react";
import { Header } from "./Header";
import { NavLinks } from "./NavLinks";
import { Sidebar } from "./Sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--ink)]">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-28 md:px-8 md:py-8 lg:pb-10">{children}</main>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-[24px] border-t border-[var(--border)] bg-white px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(27,69,58,0.08)] lg:hidden">
        <NavLinks mobile />
      </div>
    </div>
  );
}

