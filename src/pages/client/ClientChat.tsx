import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { mockChats, clientById, type MockChatMessage } from "@/lib/mocks";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const ME = clientById("c1")!;

export default function ClientChat() {
  const [messages, setMessages] = useState<MockChatMessage[]>(() =>
    mockChats.filter((m) => m.client_id === ME.id),
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const t = input.trim();
    if (!t) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        client_id: ME.id,
        sender_role: "client",
        content: t,
        created_at: new Date().toISOString(),
        read: false,
      },
    ]);
    setInput("");
    // simulate PT typing back
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-${Date.now()}`,
          client_id: ME.id,
          sender_role: "trainer",
          content: "Recebido! Já te respondo melhor 💪",
          created_at: new Date().toISOString(),
          read: false,
        },
      ]);
    }, 1500);
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border/60 bg-background/85 px-5 py-4 backdrop-blur-xl">
        <div className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">O teu PT</p>
          <p className="text-[11px] text-primary">● online</p>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef as never}>
        <div className="space-y-2 py-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.sender_role === "client" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  m.sender_role === "client"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "glass rounded-bl-sm",
                )}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p className={cn("mt-0.5 text-[9px] opacity-60", m.sender_role === "client" && "text-right")}>
                  {new Date(m.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background/85 px-3 py-2.5 backdrop-blur-xl safe-bottom">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Mensagem para o teu PT…"
            className="min-h-[40px] max-h-32 resize-none rounded-2xl"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={!input.trim()}
            className="h-10 w-10 shrink-0 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
