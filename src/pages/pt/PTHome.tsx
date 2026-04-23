import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell, ChevronRight, Sparkles, Users as UsersIcon, Wallet, MessageSquare,
  Activity, Settings as SettingsIcon, Trophy, MessageCircle, CreditCard,
  Apple, Heart, ShieldCheck, AlertTriangle, UserX, MapPin, CheckCircle2, ThumbsUp,
} from "lucide-react";
import { fmtEUR, greetingPT } from "@/lib/format";
import { cn } from "@/lib/utils";
import { mockClients, mockChats } from "@/lib/mocks";

type NotifIcon = React.ElementType;
interface Notification {
  id: string;
  icon: NotifIcon;
  text: string;
  to?: string;
  tone: "primary" | "accent" | "energy" | "destructive" | "muted";
  unread?: boolean;
}

const NOTIFICATIONS: Notification[] = [
  { id: "n1", icon: Trophy, text: 'Joana atingiu um novo record em supino — 43,5 kg!', to: "/pt/clients/c1", tone: "energy", unread: true },
  { id: "n2", icon: MessageCircle, text: "Joana mandou-te mensagem", to: "/pt/chat/c1", tone: "primary", unread: true },
  { id: "n3", icon: CreditCard, text: "Não te esqueças de confirmar o pagamento da aula de hoje", to: "/pt/business", tone: "accent", unread: true },
  { id: "n4", icon: Apple, text: "Joana tem a secção do plano de nutrição vazia, dá-lhe umas dicas!", to: "/pt/clients/c1", tone: "primary" },
  { id: "n5", icon: Heart, text: "Elogia a Joana, foi a mais ativa do mês!", to: "/pt/chat/c1", tone: "energy" },
  { id: "n6", icon: ShieldCheck, text: "Protege a tua conta — ativa autenticação 2FA.", to: "/pt/settings", tone: "muted" },
  { id: "n7", icon: AlertTriangle, text: "Plano gratuito no limite de alunos!", to: "/pt/settings", tone: "destructive" },
  { id: "n8", icon: AlertTriangle, text: "O João continua sem plano de treino!", to: "/pt/clients/c2", tone: "destructive" },
  { id: "n9", icon: Sparkles, text: "Pergunta ao FitPilot AI o que falta adicionares!", to: "/pt/ai", tone: "accent" },
  { id: "n10", icon: UserX, text: "Carla não foi treinar hoje!", to: "/pt/clients/c3", tone: "destructive" },
  { id: "n11", icon: MessageCircle, text: "Joana deixou uma mensagem na comunidade alunos", to: "/pt/chat", tone: "primary" },
  { id: "n12", icon: MapPin, text: "João está perdido no novo ginásio!", to: "/pt/chat/c2", tone: "accent" },
  { id: "n13", icon: CheckCircle2, text: "Tudo em ordem por hoje, Ricardo!", tone: "primary" },
  { id: "n14", icon: ThumbsUp, text: "Bom trabalho Ricardo, a Joana está a bombar!", tone: "energy" },
];

const TONE_CLS: Record<Notification["tone"], string> = {
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/15 text-accent",
  energy: "bg-energy/15 text-energy",
  destructive: "bg-destructive/15 text-destructive",
  muted: "bg-secondary text-muted-foreground",
};

export default function PTHome() {
  const [aiOpen, setAiOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const active = mockClients.filter((c) => c.status !== "inativo").length;
  const revenue = mockClients.reduce((s, c) => s + (c.monthly_value ?? 0) + (c.session_value ? c.session_value * 8 : 0), 0);
  const attendance = Math.round(mockClients.reduce((s, c) => s + c.attendance_pct, 0) / mockClients.length);
  const pending = mockChats.filter((m) => m.sender_role === "client" && !m.read).length;
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{greetingPT()},</p>
            <h1 className="text-2xl font-bold tracking-tight">Olá Ricardo 👋</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{active} clientes activos</p>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-xl bg-secondary"
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-glow">
                  {unreadCount}
                </span>
              )}
            </button>
            <Link to="/pt/settings" className="grid h-10 w-10 place-items-center rounded-xl bg-secondary" aria-label="Definições">
              <SettingsIcon className="h-5 w-5" />
            </Link>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                  aria-hidden
                />
                <div className="absolute right-0 top-12 z-50 w-[88vw] max-w-sm overflow-hidden rounded-2xl border border-border bg-popover shadow-card animate-fade-in">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <p className="text-sm font-bold">Notificações</p>
                    <span className="text-[11px] text-muted-foreground">{unreadCount} novas</span>
                  </div>
                  <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
                    {NOTIFICATIONS.map((n) => {
                      const Icon = n.icon;
                      const content = (
                        <div className={cn("flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50", n.unread && "bg-secondary/20")}>
                          <div className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", TONE_CLS[n.tone])}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="flex-1 text-xs leading-snug">{n.text}</p>
                          {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                        </div>
                      );
                      return (
                        <li key={n.id}>
                          {n.to ? (
                            <button
                              onClick={() => { setNotifOpen(false); navigate(n.to!); }}
                              className="block w-full"
                            >
                              {content}
                            </button>
                          ) : (
                            <div>{content}</div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            )}
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
                <strong>Mariana Costa</strong> está com 41% de assiduidade — convém contactar.
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

      <section className="px-5 pt-4">
        <Link to="/pt/clients" className="flex items-center justify-between rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-glow">
          <div>
            <p className="text-sm font-semibold">Ver todos os clientes</p>
            <p className="text-xs opacity-80">Calendário, planos e progresso</p>
          </div>
          <ChevronRight className="h-5 w-5" />
        </Link>
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
