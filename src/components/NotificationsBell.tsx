import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  icon: React.ElementType;
  text: string;
  /** Route path. Use a hash to auto-open a settings sub-section, e.g. "/pt/settings#seguranca". */
  to?: string;
  unread?: boolean;
}

interface Props {
  items: NotificationItem[];
  align?: "left" | "right";
}

/**
 * Sino de notificações minimalista.
 * - Sem cores fortes nos ícones (estética limpa, monocromática com accent só no “unread dot”).
 * - Cada item navega para um sítio específico (suporta hash para deep-link em definições).
 */
export function NotificationsBell({ items, align = "right" }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const unreadCount = items.filter((n) => n.unread).length;

  function go(to?: string) {
    setOpen(false);
    if (to) navigate(to);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none" onClick={() => setOpen(false)} aria-hidden />
          <div
            className={cn(
              "z-50 overflow-hidden rounded-2xl border border-border bg-popover shadow-card",
              // Mobile: centrado no ecrã
              "fixed left-1/2 top-20 w-[92vw] max-w-sm -translate-x-1/2",
              // Desktop (sm+): ancorado ao sino
              "sm:absolute sm:top-12 sm:left-auto sm:translate-x-0 sm:w-[88vw]",
              align === "right" ? "sm:right-0" : "sm:left-0",
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-bold">Notificações</p>
              <span className="text-[11px] text-muted-foreground">{unreadCount} novas</span>
            </div>
            <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
              {items.length === 0 && (
                <li className="px-4 py-6 text-center text-xs text-muted-foreground">Sem novidades.</li>
              )}
              {items.map((n) => {
                const Icon = n.icon;
                const inner = (
                  <div className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/40">
                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className={cn("flex-1 text-xs leading-snug", n.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                      {n.text}
                    </p>
                    {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.to ? (
                      <button onClick={() => go(n.to)} className="block w-full">{inner}</button>
                    ) : (
                      <div>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
