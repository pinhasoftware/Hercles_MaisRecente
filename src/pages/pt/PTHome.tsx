import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronRight, Sparkles, TrendingUp, Users as UsersIcon, Wallet, MessageSquare, Activity, Settings as SettingsIcon } from "lucide-react";
import { fmtEUR, greetingPT } from "@/lib/format";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { mockClients, mockSessions, mockChats, clientById } from "@/lib/mocks";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  agendado: { label: "Agendado", cls: "bg-secondary text-muted-foreground" },
  em_curso: { label: "Em curso", cls: "bg-energy/15 text-energy" },
  concluido: { label: "Concluído", cls: "bg-primary/15 text-primary" },
  atencao: { label: "Atenção", cls: "bg-destructive/15 text-destructive" },
  faltou: { label: "Faltou", cls: "bg-destructive/15 text-destructive" },
};

export default function PTHome() {
  const [aiOpen, setAiOpen] = useState(true);

  const active = mockClients.filter((c) => c.status !== "inativo").length;
  const revenue = mockClients.reduce((s, c) => s + (c.monthly_value ?? 0) + (c.session_value ? c.session_value * 8 : 0), 0);
  const attendance = Math.round(mockClients.reduce((s, c) => s + c.attendance_pct, 0) / mockClients.length);
  const pending = mockChats.filter((m) => m.sender_role === "client" && !m.read).length;

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));
  const sessions = mockSessions
    .filter((s) => {
      const d = new Date(s.scheduled_at);
      return d >= todayStart && d <= todayEnd;
    })
    .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at));

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{greetingPT()},</p>
            <h1 className="text-2xl font-bold tracking-tight">Olá Ricardo 👋</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{active} clientes activos</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary" aria-label="Notificações">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary shadow-glow" />
            </button>
            <Link to="/pt/settings" className="grid h-10 w-10 place-items-center rounded-xl bg-secondary" aria-label="Definições">
              <SettingsIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={() => setAiOpen((o) => !o)}
            className="ai-border relative flex w-full items-center justify-between rounded-2xl bg-accent/5 px-4 py-3 text-left transition-all hover:bg-accent/10"
          >
            <div className="flex items-center gap-2">
              <span className={cn("inline-block transition-transform", aiOpen && "rotate-90")}>▶</span>
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold gradient-text-ai">Pilot AI · Hoje</span>
            </div>
          </button>
          {aiOpen && (
            <div className="ai-border relative mt-2 rounded-2xl bg-accent/5 p-4 shadow-ai animate-fade-in">
              <p className="text-sm leading-relaxed">
                Tens <strong>{sessions.length} sessões</strong> hoje. <strong>Mariana Costa</strong> está com 41% de assiduidade — convém contactar.
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Link to="/pt/chat/c3" className="rounded-lg bg-accent/15 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20 text-center">Mensagem</Link>
                <Link to="/pt/clients/c3" className="rounded-lg bg-accent/15 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/20 text-center">Ver perfil</Link>
                <button
                  onClick={() => setAiOpen(false)}
                  className="rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary/80"
                >
                  Agora não
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2.5 px-5 pt-2">
        <KPI icon={UsersIcon} label="Clientes activos" value={String(active)} delta="+1" tone="primary" />
        <KPI icon={Wallet} label="Receita mensal" value={fmtEUR(revenue)} tone="primary" />
        <KPI icon={Activity} label="Assiduidade média" value={`${attendance}%`} tone="muted" />
        <Link to="/pt/chat" className="contents"><KPI icon={MessageSquare} label="Por responder" value={String(pending)} tone="muted" /></Link>
      </div>


      <section className="px-5 pt-2">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Hoje</h2>
          <span className="text-xs text-muted-foreground">{format(new Date(), "EEEE, d MMM", { locale: pt })}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sem sessões agendadas para hoje.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sessions.map((s) => {
              const st = STATUS_LABEL[s.status] ?? STATUS_LABEL.agendado;
              const c = clientById(s.client_id);
              return (
                <li key={s.id} className="glass flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-secondary/50">
                  <UserAvatar name={c?.full_name} src={c?.avatar_url} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{c?.full_name}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {s.type} · {format(new Date(s.scheduled_at), "HH:mm")}
                    </p>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", st.cls)}>{st.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 mb-2">
          <Link to="/pt/clients" className="flex items-center justify-between rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-glow">
            <div>
              <p className="text-sm font-semibold">Ver todos os clientes</p>
              <p className="text-xs opacity-80">Calendário, planos e progresso</p>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function KPI({ icon: Icon, label, value, delta, tone }: { icon: React.ElementType; label: string; value: string; delta?: string | null; tone?: "primary" | "muted" }) {
  return (
    <div className="glass rounded-2xl p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <Icon className={cn("h-4 w-4", tone === "primary" ? "text-primary" : "text-muted-foreground")} />
        {delta && <span className="text-[10px] font-bold text-primary">{delta}</span>}
      </div>
      <p className="text-xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
