import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, endOfWeek, format, isSameDay, startOfWeek, subDays } from "date-fns";
import { pt } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Mic, Send, UserPlus, Link2 } from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/UserAvatar";
import { ClientCardMenu } from "@/components/pt/ClientCardMenu";
import { cn } from "@/lib/utils";
import { mockClients, mockSessions, clientById } from "@/lib/mocks";
import { usePTUI } from "@/contexts/PTUIContext";

const TABS = ["Calendário", "Todos", "Presencial", "Consultoria", "Atenção"] as const;
type Tab = typeof TABS[number];

export default function PTClients() {
  const { clientsTab, setClientsTab, setLastClientId } = usePTUI();
  const tab = clientsTab;
  const setTab = (t: Tab) => setClientsTab(t);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [aiInput, setAiInput] = useState("");
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Landing on the list itself clears any "last opened client" so the
  // bottom-nav Clientes button stops deep-linking back into a profile.
  useEffect(() => {
    setLastClientId(null);
  }, [setLastClientId]);

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const weekSessions = useMemo(() => {
    const from = weekStart;
    const to = endOfWeek(weekStart, { weekStartsOn: 1 });
    return mockSessions.filter((s) => {
      const d = new Date(s.scheduled_at);
      return d >= from && d <= to;
    });
  }, [weekStart]);

  const sessionsBy = useMemo(() => {
    const map: Record<string, typeof mockSessions> = {};
    weekSessions.forEach((s) => {
      const k = format(new Date(s.scheduled_at), "yyyy-MM-dd");
      (map[k] ??= []).push(s);
    });
    return map;
  }, [weekSessions]);

  const dayKey = format(selectedDay, "yyyy-MM-dd");
  const eventsForDay = sessionsBy[dayKey] ?? [];

  const filtered = useMemo(() => {
    const visible = mockClients.filter((c) => !deletedIds.includes(c.id));
    if (tab === "Calendário" || tab === "Todos") return visible;
    if (tab === "Presencial") return visible.filter((c) => c.type === "presencial");
    if (tab === "Consultoria") return visible.filter((c) => c.type === "consultoria");
    if (tab === "Atenção") return visible.filter((c) => c.status === "atencao");
    return visible;
  }, [tab, deletedIds]);

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 pb-3 pt-6">
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <Link to="/pt/clients/new" className="flex h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-glow">
            <UserPlus className="h-4 w-4" /> Novo
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                tab === t ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {tab === "Calendário" ? (
        <section className="flex-1 px-5 pt-3">
          <div className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <button onClick={() => setWeekStart(subDays(weekStart, 7))} className="grid h-8 w-8 place-items-center rounded-lg bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
              <p className="text-sm font-semibold">
                {format(weekStart, "d MMM", { locale: pt })} – {format(addDays(weekStart, 6), "d MMM", { locale: pt })}
              </p>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="grid h-8 w-8 place-items-center rounded-lg bg-secondary"><ChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {week.map((d) => {
                const isSel = isSameDay(d, selectedDay);
                const isToday = isSameDay(d, new Date());
                const k = format(d, "yyyy-MM-dd");
                const has = (sessionsBy[k]?.length ?? 0) > 0;
                return (
                  <button
                    key={k}
                    onClick={() => setSelectedDay(d)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl py-2 text-xs transition-all",
                      isSel ? "bg-gradient-primary text-primary-foreground shadow-glow" : isToday ? "bg-secondary" : "hover:bg-secondary/60",
                    )}
                  >
                    <span className="text-[10px] uppercase opacity-70">{format(d, "EEEEE", { locale: pt })}</span>
                    <span className="text-base font-bold">{format(d, "d")}</span>
                    <span className={cn("h-1 w-1 rounded-full", has ? (isSel ? "bg-primary-foreground" : "bg-primary") : "bg-transparent")} />
                  </button>
                );
              })}
            </div>
          </div>

          <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {format(selectedDay, "EEEE, d MMM", { locale: pt })}
          </h3>
          {eventsForDay.length === 0 ? (
            <p className="rounded-2xl bg-secondary/50 p-4 text-center text-sm text-muted-foreground">Sem eventos.</p>
          ) : (
            <ul className="space-y-2">
              {eventsForDay.map((s) => {
                const c = clientById(s.client_id);
                return (
                  <li key={s.id} className="glass flex items-center gap-3 rounded-2xl p-3">
                    <UserAvatar name={c?.full_name} src={c?.avatar_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold">{c?.full_name}</p>
                      <p className="text-xs capitalize text-muted-foreground">{s.type} · {format(new Date(s.scheduled_at), "HH:mm")}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="sticky bottom-24 mt-6 pb-2">
            <div className="glass-strong flex items-center gap-2 rounded-full p-1.5 shadow-card">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ditar/escrever alteração ao calendário..."
                className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-muted-foreground"><Mic className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-gradient-ai text-accent-foreground shadow-ai"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex-1 px-5 pt-3">
          <ul className="space-y-2">
            {filtered.map((c) => (
              <li key={c.id} className={cn("relative glass rounded-2xl p-3", c.status === "atencao" && "border-l-2 border-l-destructive")}>
                <div className="flex items-center gap-3">
                  <Link to={`/pt/clients/${c.id}`} className="flex flex-1 items-center gap-3 min-w-0">
                    <UserAvatar name={c.full_name} src={c.avatar_url} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{c.full_name}</p>
                        {c.status === "atencao" && <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-destructive">Atenção</span>}
                      </div>
                      <p className="text-xs capitalize text-muted-foreground">
                        {c.type} · iniciou {format(new Date(c.start_date), "d MMM yy", { locale: pt })}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary" style={{ width: `${c.attendance_pct}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">{c.attendance_pct}%</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const token = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, "");
                      const url = `${window.location.origin}/auth?invite=${token}`;
                      navigator.clipboard.writeText(url);
                      toast.success(`Link de ${c.full_name} copiado`, { description: url });
                    }}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground"
                    aria-label="Copiar link de convite"
                    title="Copiar link de convite"
                  >
                    <Link2 className="h-4 w-4" />
                  </button>
                  <ClientCardMenu
                    clientId={c.id}
                    clientName={c.full_name}
                    onDeleted={(id) => setDeletedIds((prev) => [...prev, id])}
                  />
                </div>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-2xl bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
                Sem clientes nesta categoria.
              </li>
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
