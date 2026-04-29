import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { mockChats, clientById, type MockChatMessage } from "@/lib/mocks";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatComposer, ChatAttachmentBubble, type ChatAttachment } from "@/components/chat/ChatComposer";
import { usePageState } from "@/contexts/PageStateContext";

const ME = clientById("c1")!;
const KEY_MSGS = "client.chat.messages";
const KEY_DRAFT = "client.chat.draft";
const KEY_PENDING = "client.chat.pending";

export default function ClientChat() {
  const [messages, setMessages] = usePageState<MockChatMessage[]>(
    KEY_MSGS,
    mockChats.filter((m) => m.client_id === ME.id),
  );
  const [draft, setDraft] = usePageState<string>(KEY_DRAFT, "");
  const [pending, setPending] = usePageState<ChatAttachment[]>(KEY_PENDING, []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text: string, atts: ChatAttachment[]) {
    const t = text.trim();
    if (!t && atts.length === 0) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp-${Date.now()}`,
        client_id: ME.id,
        sender_role: "client",
        content: t,
        created_at: new Date().toISOString(),
        read: false,
        attachments: atts.length ? atts : undefined,
      },
    ]);
    setDraft("");
    setPending([]);
    // simula resposta do PT
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
    <div className="flex h-[calc(100dvh-5rem)] flex-col">
      <header className="flex items-center gap-3 border-b border-border/60 bg-background/85 px-5 py-4 backdrop-blur-xl">
        <div className="grid h-10 w-10 place-items-center rounded-full" style={{ background: "var(--gradient-primary)" }}>
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">O teu PT</p>
          <p className="text-[11px] text-primary">● online</p>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4" ref={scrollRef as never}>
        <div className="space-y-2 py-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex", m.sender_role === "client" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] space-y-1.5 rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  m.sender_role === "client"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "glass rounded-bl-sm",
                )}
              >
                {m.attachments?.map((a) => <ChatAttachmentBubble key={a.id} att={a} />)}
                {m.content && <p className="whitespace-pre-wrap">{m.content}</p>}
                <p className={cn("text-[9px] opacity-60", m.sender_role === "client" && "text-right")}>
                  {new Date(m.created_at).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <ChatComposer
        text={draft}
        setText={setDraft}
        pending={pending}
        setPending={setPending}
        onSend={send}
        placeholder="Mensagem para o teu PT…"
      />
    </div>
  );
}
