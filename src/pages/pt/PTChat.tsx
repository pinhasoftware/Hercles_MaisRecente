import { Send } from "lucide-react";
import { mockChats, mockClients } from "@/lib/mocks";
import { Button } from "@/components/ui/button";

export default function PTChat() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mensagens</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">Chat</h1>
      </header>
      <section className="mt-6 flex-1 space-y-3">
        {mockChats.map((message) => {
          const client = mockClients.find((item) => item.id === message.client_id)!;
          const fromClient = message.sender_role === "client";
          return (
            <article key={message.id} className={`max-w-[86%] rounded-2xl p-3 ${fromClient ? "glass" : "ml-auto bg-primary text-primary-foreground"}`}>
              <p className="mb-1 text-[10px] font-bold uppercase opacity-70">{fromClient ? client.full_name : "PT"}</p>
              <p className="text-sm">{message.content}</p>
            </article>
          );
        })}
      </section>
      <div className="glass mt-4 flex items-center gap-2 rounded-2xl p-2">
        <div className="flex-1 px-3 text-sm text-muted-foreground">Escrever mensagem...</div>
        <Button size="icon" className="rounded-xl"><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
