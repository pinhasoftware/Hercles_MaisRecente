import { Outlet } from "react-router-dom";
import { ClientBottomNav } from "./ClientBottomNav";

export function ClientLayout() {
  return (
    <div
      className="relative mx-auto flex max-w-md flex-col overflow-hidden bg-background"
      style={{ height: "100dvh" }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-gradient-glow" />
      <div
        className="relative flex flex-1 flex-col overflow-y-auto safe-top"
        style={{ paddingBottom: "calc(5rem + env(safe-area-inset-bottom))" }}
      >
        <Outlet />
      </div>
      <ClientBottomNav />
    </div>
  );
}
