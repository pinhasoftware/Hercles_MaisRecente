import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import type { DemoRole } from "@/lib/mocks";

interface DemoContextValue {
  role: DemoRole | null;
  setRole: (r: DemoRole | null) => void;
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);
const STORAGE_KEY = "fitpilot.demo.role";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<DemoRole | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem(STORAGE_KEY) as DemoRole | null) ?? null;
  });

  useEffect(() => {
    if (role) localStorage.setItem(STORAGE_KEY, role);
    else localStorage.removeItem(STORAGE_KEY);
  }, [role]);

  return <DemoContext.Provider value={{ role, setRole: setRoleState }}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
