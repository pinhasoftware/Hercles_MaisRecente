import { Activity, Scale, TrendingUp } from "lucide-react";
import { mockClientStats } from "@/lib/mocks";

export default function ClientProgress() {
  const latestWeight = mockClientStats.weight_history.at(-1)!;
  const firstWeight = mockClientStats.weight_history[0];
  const latestVolume = mockClientStats.volume_history.at(-1)!;

  return (
    <div className="px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Resultados</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Progresso</h1>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4">
          <Scale className="h-5 w-5 text-primary" />
          <p className="mt-3 text-2xl font-black">{latestWeight.kg} kg</p>
          <p className="text-xs text-muted-foreground">{(latestWeight.kg - firstWeight.kg).toFixed(1)} kg em 6 semanas</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <Activity className="h-5 w-5 text-energy" />
          <p className="mt-3 text-2xl font-black">{latestVolume.tons} t</p>
          <p className="text-xs text-muted-foreground">volume semanal</p>
        </div>
      </section>

      <section className="glass-strong mt-6 rounded-3xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold">Peso corporal</p>
            <p className="text-xs text-muted-foreground">Últimas 6 semanas</p>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div className="flex h-40 items-end gap-2">
          {mockClientStats.weight_history.map((point) => {
            const height = 35 + (79 - point.kg) * 18;
            return (
              <div key={point.week} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-primary" style={{ height: `${height}%` }} />
                <span className="text-[10px] font-bold text-muted-foreground">{point.week}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
