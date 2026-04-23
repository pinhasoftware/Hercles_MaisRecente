import { Bot, MessageSquareText, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PTAI() {
  const prompts = ["Criar plano de hipertrofia", "Adaptar treino por dor no ombro", "Resumo semanal para cliente"];

  return (
    <div className="px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assistente</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">AI Coach</h1>
      </header>
      <section className="mt-5 rounded-3xl p-5 shadow-ai" style={{ background: "var(--gradient-ai)" }}>
        <Sparkles className="h-8 w-8 text-accent-foreground" />
        <p className="mt-4 text-2xl font-black text-accent-foreground">Acelera planos, mensagens e análises.</p>
        <Button className="mt-5 h-12 w-full rounded-2xl bg-background text-foreground hover:bg-background/90"><Wand2 className="mr-2 h-4 w-4" /> Gerar sugestão</Button>
      </section>
      <section className="mt-6 space-y-3">
        {prompts.map((prompt) => (
          <article key={prompt} className="glass flex items-center gap-3 rounded-2xl p-4">
            <Bot className="h-5 w-5 text-accent" />
            <p className="flex-1 text-sm font-bold">{prompt}</p>
            <MessageSquareText className="h-5 w-5 text-muted-foreground" />
          </article>
        ))}
      </section>
    </div>
  );
}
