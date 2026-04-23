import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Trophy, Flame, Dumbbell, Camera, Plus, Trash2, ImageIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { mockClientStats } from "@/lib/mocks";
import { uploadProgressPhoto } from "@/lib/uploads";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";

interface ProgressPhoto { id: string; url: string; date: string; note?: string; }
const PHOTOS_KEY = "fitpilot.client.progressPhotos";

export default function ClientProgress() {
  const w = mockClientStats.weight_history;
  const v = mockClientStats.volume_history;
  const weightDelta = +(w[w.length - 1].kg - w[0].kg).toFixed(1);
  const volumeDelta = +(v[v.length - 1].tons - v[0].tons).toFixed(1);

  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<ProgressPhoto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setPhotos(JSON.parse(localStorage.getItem(PHOTOS_KEY) ?? "[]")); } catch { /* */ }
  }, []);

  function persist(next: ProgressPhoto[]) {
    setPhotos(next);
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(next));
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadProgressPhoto(file);
      const p: ProgressPhoto = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        url: result.url,
        date,
        note: note.trim() || undefined,
      };
      persist([p, ...photos]);
      setNote("");
      toast.success("Foto adicionada");
    } catch {
      toast.error("Falha no upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove(id: string) {
    persist(photos.filter((p) => p.id !== id));
  }

  return (
    <div className="px-5 pb-6 pt-6">
      <h1 className="text-2xl font-bold tracking-tight">Progresso</h1>
      <p className="mt-1 text-sm text-muted-foreground">Últimas 6 semanas</p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat icon={Flame} label="Streak" value={`${mockClientStats.streak_days}d`} tone="energy" />
        <Stat icon={Trophy} label="PRs" value="4" tone="primary" />
        <Stat icon={Dumbbell} label="Treinos" value="22" tone="muted" />
      </div>

      <section className="mt-6">
        <ChartCard
          title="Peso corporal"
          delta={weightDelta}
          deltaLabel="kg"
          positive={weightDelta < 0}
          current={`${w[w.length - 1].kg} kg`}
        >
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={w} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v} kg`, "Peso"]}
              />
              <Area type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="mt-4">
        <ChartCard
          title="Volume de treino"
          delta={volumeDelta}
          deltaLabel="t"
          positive={volumeDelta > 0}
          current={`${v[v.length - 1].tons} t`}
        >
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={v} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`${v} t`, "Volume"]}
              />
              <Line type="monotone" dataKey="tons" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: "hsl(var(--accent))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* PHOTOS / TIMELINE */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fotos de evolução</h2>
          <span className="text-[10px] text-muted-foreground">{photos.length} foto{photos.length !== 1 ? "s" : ""}</span>
        </div>

        <div className="glass space-y-2 rounded-2xl p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 text-xs"
            />
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nota (ex: pós-treino)"
              maxLength={60}
              className="h-10 text-xs"
            />
          </div>
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="h-11 w-full rounded-xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
          >
            {uploading ? (
              <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> A enviar...</>
            ) : (
              <><Camera className="mr-2 h-4 w-4" /> Adicionar foto</>
            )}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        </div>

        {photos.length === 0 ? (
          <div className="mt-3 grid place-items-center rounded-2xl border-2 border-dashed border-border py-10 text-center">
            <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Sem fotos ainda. Adiciona a primeira para começares a tua timeline.</p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
                <button onClick={() => setPreview(p)} className="absolute inset-0">
                  <img src={p.url} alt={p.note ?? p.date} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </button>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <p className="text-[10px] font-bold text-white">{format(new Date(p.date), "d MMM", { locale: pt })}</p>
                  {p.note && <p className="truncate text-[9px] text-white/80">{p.note}</p>}
                </div>
                <button
                  onClick={() => remove(p.id)}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
                  aria-label="Remover foto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{preview && format(new Date(preview.date), "EEEE, d MMM yyyy", { locale: pt })}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-2">
              <img src={preview.url} alt="" className="w-full rounded-xl" />
              {preview.note && <p className="text-sm text-muted-foreground">{preview.note}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <h2 className="mb-2 mt-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">Recordes pessoais</h2>
      <div className="space-y-2">
        {[
          { ex: "Agachamento", kg: 80, prev: 75 },
          { ex: "Supino plano", kg: 55, prev: 50 },
          { ex: "Peso morto", kg: 100, prev: 95 },
        ].map((pr) => (
          <div key={pr.ex} className="glass flex items-center justify-between rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-energy/15 text-energy">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold">{pr.ex}</p>
                <p className="text-[11px] text-muted-foreground">Anterior: {pr.prev} kg</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-bold">{pr.kg} kg</p>
              <p className="text-[10px] font-bold text-primary">+{pr.kg - pr.prev} kg</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: "primary" | "energy" | "muted" }) {
  const cls =
    tone === "primary" ? "bg-primary/15 text-primary" :
    tone === "energy" ? "bg-energy/15 text-energy" :
    "bg-secondary text-muted-foreground";
  return (
    <div className="glass rounded-2xl p-3">
      <div className={`mb-1.5 grid h-7 w-7 place-items-center rounded-lg ${cls}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

function ChartCard({
  title, delta, deltaLabel, positive, current, children,
}: {
  title: string; delta: number; deltaLabel: string; positive: boolean; current: string; children: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{current}</p>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${positive ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
          {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta > 0 ? "+" : ""}{delta} {deltaLabel}
        </div>
      </div>
      {children}
    </div>
  );
}
