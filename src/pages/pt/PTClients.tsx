import { Link } from "react-router-dom";
import { ChevronRight, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockClients } from "@/lib/mocks";

export default function PTClients() {
  return (
    <div className="px-5 pb-6 pt-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Acompanhamento</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Clientes</h1>
        </div>
        <Button asChild size="icon" className="rounded-2xl bg-primary text-primary-foreground shadow-glow">
          <Link to="/pt/clients/new" aria-label="Novo cliente"><Plus className="h-5 w-5" /></Link>
        </Button>
      </header>

      <section className="mt-6 space-y-3">
        {mockClients.map((client) => (
          <Link key={client.id} to={`/pt/clients/${client.id}`} className="glass flex items-center gap-3 rounded-2xl p-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold">{client.full_name}</p>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{client.status}</span>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{client.goals}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${client.attendance_pct}%` }} />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </section>
    </div>
  );
}
