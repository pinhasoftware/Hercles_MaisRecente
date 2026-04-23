import { CheckCircle2, Clock, Dumbbell, Flame, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockWorkouts } from "@/lib/mocks";

const workout = mockWorkouts[0];

export default function ClientWorkout() {
  const totalSets = workout.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);

  return (
    <div className="px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Treino de hoje</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">{workout.name}</h1>
      </header>

      <section className="mt-5 overflow-hidden rounded-3xl p-5 shadow-glow" style={{ background: "var(--gradient-primary)" }}>
        <div className="flex items-start justify-between text-primary-foreground">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase opacity-90">
              <Flame className="h-4 w-4" /> {workout.day}
            </div>
            <p className="mt-4 text-5xl font-black leading-none">{workout.exercises.length}</p>
            <p className="mt-1 text-xs opacity-80">exercícios · {totalSets} séries</p>
          </div>
          <div className="rounded-2xl bg-background/15 px-3 py-2 text-right">
            <Clock className="ml-auto h-5 w-5" />
            <p className="mt-1 text-sm font-bold">~45 min</p>
          </div>
        </div>
        <Button className="mt-5 h-12 w-full rounded-2xl bg-background text-foreground hover:bg-background/90">
          <Play className="mr-2 h-4 w-4 fill-current" /> Iniciar sessão
        </Button>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plano</h2>
        {workout.exercises.map((exercise, index) => (
          <article key={exercise.id} className="glass flex items-center gap-3 rounded-2xl p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-sm font-black text-primary">
              {index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold">{exercise.name}</p>
                {exercise.group && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">SS {exercise.group}</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {exercise.sets} séries · {exercise.mode === "time" ? `${exercise.duration_s}s` : `${exercise.reps} reps`} · descanso {exercise.rest_s}s
              </p>
            </div>
            <Dumbbell className="h-5 w-5 text-muted-foreground" />
          </article>
        ))}
      </section>

      <section className="glass mt-6 flex items-center gap-3 rounded-2xl p-4">
        <CheckCircle2 className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm font-bold">Registo preparado</p>
          <p className="text-xs text-muted-foreground">As séries ficam prontas para marcar quando iniciares.</p>
        </div>
      </section>
    </div>
  );
}
