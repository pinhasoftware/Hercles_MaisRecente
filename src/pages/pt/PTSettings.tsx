import { Bell, Brain, LogOut, Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";

export default function PTSettings() {
  const { setRole } = useDemo();
  const rows = [
    { icon: UserCog, label: "Perfil profissional", value: "Personal trainer" },
    { icon: Bell, label: "Notificações", value: "Clientes, pagamentos e chat" },
    { icon: Brain, label: "Assistente AI", value: "Sugestões de planos" },
    { icon: Shield, label: "Segurança", value: "Sessão demo protegida" },
  ];

  return (
    <div className="px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conta PT</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Definições</h1>
      </header>
      <section className="mt-6 space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <article key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><Icon className="h-5 w-5" /></div>
            <div><p className="text-sm font-bold">{label}</p><p className="text-xs text-muted-foreground">{value}</p></div>
          </article>
        ))}
      </section>
      <Button variant="secondary" className="mt-6 h-12 w-full rounded-2xl" onClick={() => setRole(null)}>
        <LogOut className="mr-2 h-4 w-4" /> Trocar perfil demo
      </Button>
    </div>
  );
}
