import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Memória global da app — estilo WhatsApp.
 * Cada componente regista uma chave (key) e recebe / persiste o seu estado.
 * O estado vive em RAM enquanto a app está aberta e é também copiado para
 * localStorage para sobreviver a recargas no mesmo dispositivo.
 *
 * Use it for: rascunhos de chat/AI, scroll position, tabs ativas, formulários.
 */

const STORAGE_KEY = "fitpilot.pageState.v1";

type Store = Record<string, unknown>;

interface Ctx {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
}

const PageStateContext = createContext<Ctx | undefined>(undefined);

function loadInitial(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function PageStateProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<Store>(loadInitial());
  const flushTimer = useRef<number | null>(null);

  const persist = useCallback(() => {
    if (flushTimer.current) window.clearTimeout(flushTimer.current);
    flushTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storeRef.current));
      } catch { /* ignore quota */ }
    }, 250);
  }, []);

  const get = useCallback(<T,>(key: string, fallback: T): T => {
    const cur = storeRef.current[key];
    return (cur === undefined ? fallback : (cur as T));
  }, []);

  const set = useCallback(<T,>(key: string, value: T) => {
    storeRef.current[key] = value;
    persist();
  }, [persist]);

  return <PageStateContext.Provider value={{ get, set }}>{children}</PageStateContext.Provider>;
}

function useStore() {
  const ctx = useContext(PageStateContext);
  if (!ctx) throw new Error("usePageState must be used within PageStateProvider");
  return ctx;
}

/**
 * Hook estilo useState mas com memória global por chave.
 * Exemplo: const [draft, setDraft] = usePageState("pt.ai.draft", "");
 */
export function usePageState<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const store = useStore();
  const [state, setState] = useState<T>(() => store.get(key, initial));

  // Persiste sempre que muda
  useEffect(() => {
    store.set(key, state);
  }, [key, state, store]);

  const update = useCallback((v: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      return next;
    });
  }, []);

  return [state, update];
}
