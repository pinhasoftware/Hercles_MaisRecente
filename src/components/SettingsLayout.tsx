import { ReactNode, useState } from "react";
import { ArrowLeft, Search, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface Props {
  title: string;
  backTo: string;
  sections: SettingsSection[];
  active: string;
  onSelect: (id: string) => void;
  children: ReactNode;
  onSave?: () => void;
}

export function SettingsLayout({ title, backTo, sections, active, onSelect, children, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = sections.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/90 px-4 py-3 backdrop-blur-xl">
        <Link to={backTo} className="grid h-9 w-9 place-items-center rounded-xl bg-secondary">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="flex-1 text-base font-bold tracking-tight">{title}</h1>
        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-xl bg-secondary md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-40 w-64 border-r border-border/60 bg-background pt-14 transition-transform md:relative md:z-0 md:w-56 md:translate-x-0 md:pt-0",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar"
                className="h-9 rounded-lg pl-7 text-xs"
              />
            </div>
          </div>
          <nav className="space-y-0.5 p-2">
            {filtered.map((s) => {
              const Icon = s.icon;
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => { onSelect(s.id); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-colors",
                    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-5 py-5">
          {children}
          {onSave && (
            <div className="sticky bottom-0 mt-8 -mx-5 border-t border-border/60 bg-background/90 px-5 py-3 backdrop-blur-xl">
              <Button onClick={onSave} className="h-11 w-full bg-gradient-primary text-primary-foreground">
                Guardar alterações
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
