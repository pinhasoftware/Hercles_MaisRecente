import { ReactNode, useMemo, useState } from "react";
import { ArrowLeft, Search, ChevronRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  /** Lista de itens/opções pesquisáveis dentro da secção. */
  items?: string[];
}

interface Props {
  title: string;
  backTo: string;
  sections: SettingsSection[];
  active: string | null;
  onSelect: (id: string | null) => void;
  children: ReactNode;
  onSave?: () => void;
}

export function SettingsLayout({ title, backTo, sections, active, onSelect, children, onSave }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!q) return null;
    return sections
      .map((s) => {
        const sectionMatch = s.label.toLowerCase().includes(q);
        const matchedItems = (s.items ?? []).filter((it) => it.toLowerCase().includes(q));
        if (sectionMatch || matchedItems.length > 0) {
          return { section: s, sectionMatch, matchedItems };
        }
        return null;
      })
      .filter((x): x is { section: SettingsSection; sectionMatch: boolean; matchedItems: string[] } => !!x);
  }, [sections, q]);

  function handleBack() {
    if (active) {
      onSelect(null);
    } else {
      navigate(backTo);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={handleBack}
          className="grid h-9 w-9 place-items-center rounded-xl bg-secondary"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="flex-1 text-base font-bold tracking-tight">
          {active ? sections.find((s) => s.id === active)?.label ?? title : title}
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-5 py-5">
          {!active && (
            <>
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Pesquisar nas definições"
                  className="h-11 rounded-xl pl-9"
                />
              </div>

              {matches ? (
                <div className="space-y-2">
                  {matches.length === 0 && (
                    <p className="rounded-xl bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                      Sem resultados para "{query}".
                    </p>
                  )}
                  {matches.map(({ section, matchedItems }) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => { onSelect(section.id); setQuery(""); }}
                        className="flex w-full items-center gap-3 rounded-xl bg-secondary/40 p-3 text-left hover:bg-secondary/70"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{section.label}</p>
                          {matchedItems.length > 0 && (
                            <p className="truncate text-xs text-muted-foreground">
                              {matchedItems.slice(0, 3).join(" · ")}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {sections.map((s) => {
                    const Icon = s.icon;
                    return (
                      <li key={s.id}>
                        <button
                          onClick={() => onSelect(s.id)}
                          className="flex w-full items-center gap-3 rounded-xl bg-secondary/30 px-4 py-4 text-left transition-colors hover:bg-secondary/60"
                        >
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="flex-1 text-sm font-semibold">{s.label}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {active && (
            <>
              {children}
              {onSave && (
                <div className="sticky bottom-0 mt-8 -mx-5 border-t border-border/60 bg-background/90 px-5 py-3 backdrop-blur-xl">
                  <Button onClick={onSave} className="h-11 w-full bg-gradient-primary text-primary-foreground">
                    Guardar alterações
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Exportado caso futuras secções queiram usar accordion inline
export { ChevronDown };
