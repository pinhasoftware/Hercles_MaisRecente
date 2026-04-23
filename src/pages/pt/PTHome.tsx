import { CalendarClock, Euro, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { mockClients, mockSessions, overduePayments } from "@/lib/mocks";

export default function PTHome() {
  const todaySessions = mockSessions.filter((session) => new Date(session.scheduled_at).toDateString() === new Date().toDateString());

  return (
    <div className="px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Bom trabalho</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Painel PT</h1>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <Link to="/pt/clients" className="glass rounded-2xl p-4">
          <Users className="h-5 w-5 text-primary" />
          <p className="mt-3 text-3xl font-black">{mockClients.length}</p>
          <p className="text-xs text-muted-foreground">clientes ativos</p>
        </Link>
        <Link to="/pt/business" className="glass rounded-2xl p-4">
          <Euro className="h-5 w-5 text-energy" />
          <p className="mt-3 text-3xl font-black">{overduePayments().length}</p>
          <p className="text-xs text-muted-foreground">pagamentos em atraso</p>
        </Link>
      </section>

      <section className="mt-6 rounded-3xl p-5 shadow-glow" style={{ background: "var(--gradient-primary)" }}>
        <div className="flex items-center justify-between text-primary-foreground">
          <div>
            <p className="text-xs font-bold uppercase opacity-80">Hoje</p>
            <p className="mt-1 text-5xl font-black">{todaySessions.length}</p>
            <p className="text-xs opacity-80">sessões marcadas</p>
          </div>
          <CalendarClock className="h-10 w-10" />
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Agenda</h2>
        {todaySessions.map((session) => {
          const client = mockClients.find((item) => item.id === session.client_id)!;
          return (
            <article key={session.id} className="glass flex items-center gap-3 rounded-2xl p-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{client.full_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(session.scheduled_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })} · {session.duration_min} min</p>
              </div>
              <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">{session.status}</span>
            </article>
          );
        })}
      </section>
    </div>
  );
}
