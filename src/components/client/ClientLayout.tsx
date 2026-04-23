import { Outlet } from "react-router-dom";
import { ClientBottomNav } from "./ClientBottomNav";

export function ClientLayout() {
  return (
    <div className="relative mx-auto flex h-screen max-w-md flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-gradient-glow" />
      <div className="relative flex flex-1 flex-col overflow-y-auto pb-20">
        <Outlet />
      </div>
      <ClientBottomNav />
    </div>
  );
}

