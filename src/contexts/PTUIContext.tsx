import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Tab = "Calendário" | "Todos" | "Presencial" | "Consultoria" | "Atenção";

interface PTUIState {
  clientsTab: Tab;
  setClientsTab: (t: Tab) => void;
  lastClientId: string | null;
  setLastClientId: (id: string | null) => void;
  /** Returns the route to land on when re-entering the Clients tab. */
  resolveClientsRoute: () => string;
}

const PTUIContext = createContext<PTUIState | undefined>(undefined);

const KEY_TAB = "fitpilot.pt.clientsTab";
const KEY_LAST = "fitpilot.pt.lastClientId";

export function PTUIProvider({ children }: { children: ReactNode }) {
  // sessionStorage: persiste enquanto a app está aberta, reseta ao fechar.
  const [clientsTab, setTabState] = useState<Tab>(() => {
    if (typeof window === "undefined") return "Calendário";
    return (sessionStorage.getItem(KEY_TAB) as Tab | null) ?? "Calendário";
  });
  const [lastClientId, setLastIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(KEY_LAST);
  });

  useEffect(() => {
    sessionStorage.setItem(KEY_TAB, clientsTab);
  }, [clientsTab]);

  useEffect(() => {
    if (lastClientId) sessionStorage.setItem(KEY_LAST, lastClientId);
    else sessionStorage.removeItem(KEY_LAST);
  }, [lastClientId]);

  function resolveClientsRoute() {
    if (lastClientId) return `/pt/clients/${lastClientId}`;
    return "/pt/clients";
  }

  return (
    <PTUIContext.Provider
      value={{
        clientsTab,
        setClientsTab: setTabState,
        lastClientId,
        setLastClientId: setLastIdState,
        resolveClientsRoute,
      }}
    >
      {children}
    </PTUIContext.Provider>
  );
}

export function usePTUI() {
  const ctx = useContext(PTUIContext);
  if (!ctx) throw new Error("usePTUI must be used within PTUIProvider");
  return ctx;
}
