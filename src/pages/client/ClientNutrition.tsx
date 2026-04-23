import { useEffect, useState } from "react";
import { Apple, Flame, Beef, Wheat, Droplet, Lightbulb, ShoppingCart, Plus, Trash2, Check } from "lucide-react";
import { mockMeals } from "@/lib/mocks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const totals = mockMeals.reduce(
  (acc, m) => ({
    kcal: acc.kcal + m.kcal,
    protein: acc.protein + m.protein,
    carbs: acc.carbs + m.carbs,
    fat: acc.fat + m.fat,
  }),
  { kcal: 0, protein: 0, carbs: 0, fat: 0 },
);

const targets = { kcal: 2200, protein: 160, carbs: 220, fat: 65 };

// Tips coming from the PT
const ptTips = [
  "Bebe pelo menos 2L de água por dia.",
  "Inclui uma fonte de proteína em cada refeição (carne, peixe, ovos, leguminosas).",
  "Evita refeições muito pesadas 1h antes do treino.",
  "Privilegia hidratos integrais (arroz integral, aveia, batata doce).",
  "Frutas e legumes em pelo menos 3 refeições por dia.",
  "Cheat meal 1×/semana é normal — não te penalizes.",
];

export default function ClientNutrition() {
  return (
    <div className="px-5 pb-6 pt-6">
      <div className="mb-1 flex items-center gap-2">
        <Apple className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Nutrição</h1>
      </div>
      <p className="text-sm text-muted-foreground">Plano definido pelo teu PT</p>

      <Tabs defaultValue="simples" className="mt-5">
        <TabsList className="grid h-11 w-full grid-cols-3 rounded-full bg-secondary/60 p-1">
          <TabsTrigger value="simples" className="rounded-full text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Lightbulb className="mr-1 h-3.5 w-3.5" /> Dicas
          </TabsTrigger>
          <TabsTrigger value="macros" className="rounded-full text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Flame className="mr-1 h-3.5 w-3.5" /> Macros
          </TabsTrigger>
          <TabsTrigger value="lista" className="rounded-full text-xs font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Lista
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: simples — só dicas do PT */}
        <TabsContent value="simples" className="mt-5 space-y-3">
          <div className="ai-border relative rounded-3xl bg-accent/5 p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-bold uppercase tracking-wider gradient-text-ai">Dicas do teu PT</h2>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sem contas, sem stress. Foca-te nestes princípios e estás no caminho certo.
            </p>
          </div>

          <ul className="space-y-2">
            {ptTips.map((tip, i) => (
              <li key={i} className="glass flex items-start gap-3 rounded-2xl p-4">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {i + 1}
                </div>
                <p className="text-sm leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-2xl bg-secondary/40 p-3 text-center text-[11px] text-muted-foreground">
            💬 Dúvidas sobre alimentação? Fala com o teu PT no chat.
          </p>
        </TabsContent>

        {/* TAB 2: macros (versão original) */}
        <TabsContent value="macros" className="mt-5">
          <div className="glass rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total diário</p>
                <p className="mt-1 text-3xl font-black tracking-tight">
                  {totals.kcal}<span className="text-base font-normal text-muted-foreground"> / {targets.kcal} kcal</span>
                </p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
                <Flame className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Macro icon={Beef} label="Proteína" value={totals.protein} target={targets.protein} unit="g" color="hsl(159 100% 45%)" />
              <Macro icon={Wheat} label="Hidratos" value={totals.carbs} target={targets.carbs} unit="g" color="hsl(38 92% 50%)" />
              <Macro icon={Droplet} label="Gordura" value={totals.fat} target={targets.fat} unit="g" color="hsl(263 79% 57%)" />
            </div>
          </div>

          <h2 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Refeições</h2>
          <div className="space-y-3">
            {mockMeals.map((m) => (
              <div key={m.id} className="glass rounded-2xl p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold tabular-nums">{m.time}</span>
                    <p className="text-sm font-bold">{m.name}</p>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{m.kcal} kcal</p>
                </div>
                <ul className="space-y-1">
                  {m.items.map((it, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {it}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <Pill label={`P ${m.protein}g`} />
                  <Pill label={`H ${m.carbs}g`} />
                  <Pill label={`G ${m.fat}g`} />
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 rounded-2xl bg-secondary/40 p-3 text-center text-[11px] text-muted-foreground">
            🔒 Plano gerido pelo teu PT. Para alterações, fala no chat.
          </p>
        </TabsContent>

        {/* TAB 3: lista de supermercado */}
        <TabsContent value="lista" className="mt-5">
          <ShoppingList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Macro({ icon: Icon, label, value, target, unit, color }: { icon: React.ElementType; label: string; value: number; target: number; unit: string; color: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <Icon className="h-3 w-3" style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-base font-bold tabular-nums">{value}<span className="text-[10px] text-muted-foreground">/{target}{unit}</span></p>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{label}</span>;
}

// ----------------- Shopping list -----------------
interface ShopItem {
  id: string;
  name: string;
  done: boolean;
}

const SHOP_KEY = "fitpilot.shopping";
const defaultItems: ShopItem[] = [
  { id: "1", name: "Peito de frango (1kg)", done: false },
  { id: "2", name: "Ovos (12)", done: false },
  { id: "3", name: "Aveia", done: false },
  { id: "4", name: "Batata doce", done: false },
  { id: "5", name: "Brócolos", done: false },
  { id: "6", name: "Iogurte grego", done: false },
];

function ShoppingList() {
  const [items, setItems] = useState<ShopItem[]>(() => {
    if (typeof window === "undefined") return defaultItems;
    try {
      const raw = localStorage.getItem(SHOP_KEY);
      return raw ? JSON.parse(raw) : defaultItems;
    } catch {
      return defaultItems;
    }
  });
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    localStorage.setItem(SHOP_KEY, JSON.stringify(items));
  }, [items]);

  function addItem() {
    const name = newItem.trim();
    if (!name) return;
    setItems((prev) => [...prev, { id: crypto.randomUUID?.() ?? String(Date.now()), name, done: false }]);
    setNewItem("");
  }

  function toggle(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearDone() {
    setItems((prev) => prev.filter((i) => !i.done));
  }

  const remaining = items.filter((i) => !i.done).length;

  return (
    <div>
      <div className="glass rounded-3xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Lista de compras</p>
            <p className="mt-1 text-2xl font-black tracking-tight">
              {remaining} <span className="text-base font-normal text-muted-foreground">por comprar</span>
            </p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/15">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Adicionar item..."
          className="rounded-full bg-secondary/60"
        />
        <Button onClick={addItem} className="h-10 rounded-full bg-gradient-primary px-4 text-primary-foreground shadow-glow">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {items.length === 0 && (
          <li className="rounded-2xl bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
            A lista está vazia. Adiciona itens em cima.
          </li>
        )}
        {items.map((it) => (
          <li
            key={it.id}
            className={cn(
              "glass flex items-center gap-3 rounded-2xl p-3 transition-all",
              it.done && "opacity-50",
            )}
          >
            <button
              onClick={() => toggle(it.id)}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all",
                it.done ? "bg-primary text-primary-foreground" : "border-2 border-border bg-transparent",
              )}
              aria-label="Marcar"
            >
              {it.done && <Check className="h-4 w-4" strokeWidth={3} />}
            </button>
            <span className={cn("flex-1 text-sm", it.done && "line-through")}>{it.name}</span>
            <button onClick={() => remove(it.id)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {items.some((i) => i.done) && (
        <button onClick={clearDone} className="mt-4 w-full rounded-full bg-secondary/60 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
          Limpar comprados
        </button>
      )}
    </div>
  );
}
