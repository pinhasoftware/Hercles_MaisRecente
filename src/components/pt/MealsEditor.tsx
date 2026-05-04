import { useEffect, useState } from "react";
import { Plus, Trash2, Check, X, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockMeals } from "@/lib/mocks";
import { cn } from "@/lib/utils";

interface Meal {
  id: string;
  time: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
}

export function MealsEditor({ clientId }: { clientId: string }) {
  const KEY = `fitpilot.client.meals.${clientId}`;
  const [meals, setMeals] = useState<Meal[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* */ }
    return mockMeals as Meal[];
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(meals)); } catch { /* */ }
  }, [meals, KEY]);

  function update(id: string, patch: Partial<Meal>) {
    setMeals((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function remove(id: string) { setMeals((prev) => prev.filter((m) => m.id !== id)); }
  function add() {
    const id = crypto.randomUUID?.() ?? String(Date.now());
    setMeals((prev) => [...prev, { id, time: "12:00", name: "Nova refeição", kcal: 0, protein: 0, carbs: 0, fat: 0, items: [] }]);
    setEditingId(id);
  }

  return (
    <div className="space-y-3">
      {meals.map((m) => {
        const editing = editingId === m.id;
        return (
          <div key={m.id} className="glass rounded-2xl p-3.5">
            {editing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input value={m.time} onChange={(e) => update(m.id, { time: e.target.value })} placeholder="HH:MM" className="w-24 rounded-xl" />
                  <Input value={m.name} onChange={(e) => update(m.id, { name: e.target.value })} placeholder="Nome" className="flex-1 rounded-xl" />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <NumIn label="kcal" v={m.kcal} on={(v) => update(m.id, { kcal: v })} />
                  <NumIn label="P" v={m.protein} on={(v) => update(m.id, { protein: v })} />
                  <NumIn label="H" v={m.carbs} on={(v) => update(m.id, { carbs: v })} />
                  <NumIn label="G" v={m.fat} on={(v) => update(m.id, { fat: v })} />
                </div>
                <div className="space-y-1">
                  {m.items.map((it, i) => (
                    <div key={i} className="flex gap-1.5">
                      <Input
                        value={it}
                        onChange={(e) => {
                          const next = [...m.items]; next[i] = e.target.value; update(m.id, { items: next });
                        }}
                        className="rounded-xl"
                      />
                      <button onClick={() => update(m.id, { items: m.items.filter((_, j) => j !== i) })} className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => update(m.id, { items: [...m.items, ""] })} className="text-xs font-semibold text-primary hover:underline">
                    + adicionar item
                  </button>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => remove(m.id)} className="text-destructive">
                    <Trash2 className="mr-1 h-3 w-3" /> Apagar
                  </Button>
                  <Button size="sm" onClick={() => setEditingId(null)}>
                    <Check className="mr-1 h-3 w-3" /> Concluir
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="font-semibold">{m.time} · {m.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{m.kcal} kcal</span>
                    <button onClick={() => setEditingId(m.id)} className="grid h-7 w-7 place-items-center rounded-md bg-secondary text-muted-foreground hover:text-foreground">
                      <Edit2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{m.items.join(", ") || "—"}</p>
                <div className="mt-2 flex gap-1.5">
                  <Pill>P {m.protein}g</Pill><Pill>H {m.carbs}g</Pill><Pill>G {m.fat}g</Pill>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <button
        onClick={add}
        className={cn("flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary")}
      >
        <Plus className="h-3.5 w-3.5" /> Adicionar refeição
      </button>
    </div>
  );
}

function NumIn({ label, v, on }: { label: string; v: number; on: (v: number) => void }) {
  return (
    <div>
      <Input type="number" inputMode="decimal" value={v} onChange={(e) => on(Math.max(0, Number(e.target.value) || 0))} className="h-9 rounded-xl text-center" />
      <p className="mt-0.5 text-center text-[9px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{children}</span>;
}
