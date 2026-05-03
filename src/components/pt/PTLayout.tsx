import { Outlet } from "react-router-dom";
import { PTBottomNav } from "./PTBottomNav";
import { PTSidebar } from "./PTSidebar";

export function PTLayout() {
  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-background">
      <PTSidebar />
      <div className="relative mx-auto flex h-full w-full max-w-md flex-1 flex-col overflow-hidden md:max-w-none">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-gradient-glow" />
        <div
          className="relative flex flex-1 flex-col overflow-y-auto overscroll-none safe-top"
          style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </div>
        <div className="md:hidden">
          <PTBottomNav />
        </div>
      </div>
    </div>
  );
}
