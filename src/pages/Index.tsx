import { ArrowRight, Dumbbell, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/contexts/DemoContext";

export default function Index() {
  const navigate = useNavigate();
  const { setRole } = useDemo();

  const enterApp = (role: "trainer" | "client") => {
    setRole(role);
    navigate(role === "trainer" ? "/pt" : "/app");
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col overflow-hidden bg-background px-5 py-6 text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-glow" />

      <section className="relative flex flex-1 flex-col justify-between gap-8">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
                <Dumbbell className="h-5 w-5" />
              </div>
              <p className="text-lg font-black tracking-tight">FitPilot</p>
            </div>
            <div className="rounded-full border border-border/70 bg-secondary px-3 py-1 text-[11px] font-bold uppercase text-muted-foreground">
              Demo
            </div>
          </div>

          <div className="mt-14">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Plataforma PT
            </p>
            <h1 className="text-5xl font-black leading-[0.95] tracking-tight">
              Gestão de treino com energia de app premium.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
              Entra como personal trainer ou cliente para veres dashboards, treinos, chat, progresso e faturação.
            </p>
          </div>
        </div>

        <div className="space-y-3 pb-4">
          <button
            type="button"
            onClick={() => enterApp("trainer")}
            className="glass-strong flex w-full items-center justify-between rounded-3xl p-4 text-left transition-transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Users className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-base font-bold">Entrar como PT</span>
                <span className="block text-xs text-muted-foreground">Clientes, IA, chat e negócio</span>
              </span>
            </span>
            <ArrowRight className="h-5 w-5 text-primary" />
          </button>

          <Button
            type="button"
            onClick={() => enterApp("client")}
            className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-black text-primary-foreground shadow-glow"
          >
            Entrar como cliente
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </main>
  );
}