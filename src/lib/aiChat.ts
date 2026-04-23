import { supabase } from "./supabase";

const SUPABASE_URL = "https://tynoqcelrnqofmdzhxgd.supabase.co";
const CHAT_URL = `${SUPABASE_URL}/functions/v1/chat`;

export type ChatMsg = { role: "user" | "assistant"; content: string };

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: ChatMsg[];
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
  signal?: AbortSignal;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      const data = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
      onError(data.error || `Erro ${resp.status}`);
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let done = false;

    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buffer += decoder.decode(value, { stream: true });

      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") {
          done = true;
          break;
        }
        try {
          const parsed = JSON.parse(json);
          const c = parsed?.choices?.[0]?.delta?.content;
          if (c) onDelta(c);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    onDone();
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return;
    onError(e instanceof Error ? e.message : "Erro de rede");
  }
}

export async function fetchSuggestions(context: ChatMsg[]): Promise<string[]> {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify({ messages: context, mode: "suggest" }),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : [];
  } catch {
    return [];
  }
}
