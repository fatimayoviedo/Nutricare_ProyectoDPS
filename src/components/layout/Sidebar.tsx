import { Brand } from "./Brand";
import { NavLinks } from "./NavLinks";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[var(--border)] bg-white px-5 py-7 lg:flex lg:flex-col">
      <div className="px-2"><Brand /></div>
      <div className="mt-10 flex-1"><NavLinks /></div>
    </aside>
  );
}
