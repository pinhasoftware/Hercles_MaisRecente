import { Bell, LogOut, Shield, Smartphone, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";
import { clientById } from "@/lib/mocks";

const me = clientById("c1")!;

export default function ClientSettings() {
  const { setRole } = useDemo();

  const rows = [
    { icon: UserRound, label: "Perfil", value: me.full_name },
    { icon: Bell, label: "Notificações", value: "Treinos e mensagens" },
    { icon: Smartphone, label: "Dispositivo", value: "App móvel" },
    { icon: Shield, label: "Privacidade", value: "Dados protegidos" },
  ];

  return (
    <div className="px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conta</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Definições</h1>
      </header>

      <section className="glass-strong mt-6 rounded-3xl p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-xl font-black text-primary-foreground shadow-glow">
            {me.full_name.split(" ").map((name) => name[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-lg font-bold">{me.full_name}</p>
            <p className="text-xs text-muted-foreground">Cliente ativo · {me.goals}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <article key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{label}</p>
              <p className="truncate text-xs text-muted-foreground">{value}</p>
            </div>
          </article>
        ))}
      </section>

      <Button variant="secondary" className="mt-6 h-12 w-full rounded-2xl" onClick={() => setRole(null)}>
        <LogOut className="mr-2 h-4 w-4" /> Trocar perfil demo
      </Button>
    </div>
  );
}
