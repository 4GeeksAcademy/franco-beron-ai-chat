"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

type TokenTotals = {
  prompt: number;
  completion: number;
  total: number;
};

type ChatApiResponse = {
  content: string;
  usage: Usage;
  model: string;
  responseTimeMs: number;
  tokensPerSecond: number | null;
  knowledgeLoaded?: boolean;
};

const STORAGE_KEYS = {
  messages: "groq-chat-messages",
  totals: "groq-chat-token-totals",
  lastUsage: "groq-chat-last-usage",
  model: "groq-chat-last-model",
  responseMs: "groq-chat-last-response-ms",
  tps: "groq-chat-last-tps",
  knowledgePrimed: "groq-chat-knowledge-primed",
  enterToSend: "groq-chat-enter-to-send",
};

const EMPTY_USAGE: Usage = {
  prompt_tokens: 0,
  completion_tokens: 0,
  total_tokens: 0,
};

const EMPTY_TOTALS: TokenTotals = {
  prompt: 0,
  completion: 0,
  total: 0,
};

function readStorageJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

function readStorageNumber(key: string): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStorageString(key: string, fallback: string): string {
  if (typeof window === "undefined") {
    return fallback;
  }
  return localStorage.getItem(key) ?? fallback;
}

function readSessionBoolean(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return sessionStorage.getItem(key) === "1";
}

function readStorageBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = localStorage.getItem(key);
  if (raw === "1") {
    return true;
  }
  if (raw === "0") {
    return false;
  }
  return fallback;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsage, setLastUsage] = useState<Usage>(EMPTY_USAGE);
  const [tokenTotals, setTokenTotals] = useState<TokenTotals>(EMPTY_TOTALS);
  const [lastModel, setLastModel] = useState("-");
  const [lastResponseMs, setLastResponseMs] = useState<number | null>(null);
  const [lastTokensPerSecond, setLastTokensPerSecond] = useState<number | null>(
    null,
  );
  const [knowledgePrimed, setKnowledgePrimed] = useState(false);
  const [enterToSend, setEnterToSend] = useState(true);
  const [hasHydrated, setHasHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setMessages(readStorageJSON<ChatMessage[]>(STORAGE_KEYS.messages, []));
      setTokenTotals(
        readStorageJSON<TokenTotals>(STORAGE_KEYS.totals, EMPTY_TOTALS),
      );
      setLastUsage(readStorageJSON<Usage>(STORAGE_KEYS.lastUsage, EMPTY_USAGE));
      setLastModel(readStorageString(STORAGE_KEYS.model, "-"));
      setLastResponseMs(readStorageNumber(STORAGE_KEYS.responseMs));
      setLastTokensPerSecond(readStorageNumber(STORAGE_KEYS.tps));
      setKnowledgePrimed(readSessionBoolean(STORAGE_KEYS.knowledgePrimed));
      setEnterToSend(readStorageBoolean(STORAGE_KEYS.enterToSend, true));
      setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(messages));
  }, [messages, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.totals, JSON.stringify(tokenTotals));
  }, [tokenTotals, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.lastUsage, JSON.stringify(lastUsage));
  }, [lastUsage, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.model, lastModel);
  }, [lastModel, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (lastResponseMs !== null) {
      localStorage.setItem(STORAGE_KEYS.responseMs, String(lastResponseMs));
    }
  }, [lastResponseMs, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (lastTokensPerSecond !== null) {
      localStorage.setItem(STORAGE_KEYS.tps, String(lastTokensPerSecond));
    }
  }, [lastTokensPerSecond, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    if (knowledgePrimed) {
      sessionStorage.setItem(STORAGE_KEYS.knowledgePrimed, "1");
    }
  }, [knowledgePrimed, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.enterToSend, enterToSend ? "1" : "0");
  }, [enterToSend, hasHydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleClear = () => {
    setMessages([]);
    setInput("");
    setError(null);
    setLastUsage(EMPTY_USAGE);
    setTokenTotals(EMPTY_TOTALS);
    setLastModel("-");
    setLastResponseMs(null);
    setLastTokensPerSecond(null);
    setKnowledgePrimed(false);

    localStorage.removeItem(STORAGE_KEYS.messages);
    localStorage.removeItem(STORAGE_KEYS.totals);
    localStorage.removeItem(STORAGE_KEYS.lastUsage);
    localStorage.removeItem(STORAGE_KEYS.model);
    localStorage.removeItem(STORAGE_KEYS.responseMs);
    localStorage.removeItem(STORAGE_KEYS.tps);
    sessionStorage.removeItem(STORAGE_KEYS.knowledgePrimed);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setError(null);
    setInput("");

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
          includeKnowledge: !knowledgePrimed,
        }),
      });

      const data = (await response.json()) as
        | ChatApiResponse
        | { error?: string; details?: string };

      if (!response.ok) {
        throw new Error(
          data && "error" in data && data.error
            ? data.error
            : "No se pudo obtener respuesta de la IA.",
        );
      }

      const chatData = data as ChatApiResponse;
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: chatData.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLastUsage(chatData.usage);
      setLastModel(chatData.model || "-");
      setLastResponseMs(chatData.responseTimeMs ?? null);
      setLastTokensPerSecond(chatData.tokensPerSecond ?? null);
      if (chatData.knowledgeLoaded) {
        setKnowledgePrimed(true);
      }
      setTokenTotals((prev) => ({
        prompt: prev.prompt + chatData.usage.prompt_tokens,
        completion: prev.completion + chatData.usage.completion_tokens,
        total: prev.total + chatData.usage.total_tokens,
      }));
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Ocurrió un error inesperado.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isModEnter =
      event.key === "Enter" && (event.ctrlKey || event.metaKey);

    if (isModEnter) {
      event.preventDefault();
      if (!isLoading && input.trim()) {
        event.currentTarget.form?.requestSubmit();
      }
      return;
    }

    if (enterToSend && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && input.trim()) {
        event.currentTarget.form?.requestSubmit();
      }
    }
  };

  const completionPct = useMemo(() => {
    if (!lastUsage.total_tokens) {
      return 0;
    }
    return Math.round(
      (lastUsage.completion_tokens / lastUsage.total_tokens) * 100,
    );
  }, [lastUsage]);

  const promptPct = useMemo(() => {
    if (!lastUsage.total_tokens) {
      return 0;
    }
    return Math.round((lastUsage.prompt_tokens / lastUsage.total_tokens) * 100);
  }, [lastUsage]);

  return (
    <div className="h-dvh overflow-hidden bg-[#0b1326] text-[#dae2fd]">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#434655] bg-[#171f33]/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-[1800px] items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#b4c5ff]">
              Groq AI Chat
            </h1>
            <span className="hidden h-8 w-px bg-[#434655] md:block" />
            <p className="hidden text-sm text-[#c3c6d7] md:block">
              Chat con IA + métricas de consumo en tiempo real
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#4ae176]/20 bg-[#4ae176]/10 px-3 py-1.5 text-[#4ae176]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ae176]" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em]">
              System Online
            </span>
          </div>
        </div>
      </header>

      <div className="h-[calc(100dvh-80px)] pt-20 md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_340px]">
        <aside className="hidden h-[calc(100dvh-80px)] border-r border-[#434655] bg-[#060e20] p-5 md:flex md:flex-col">
          <button
            type="button"
            className="mb-8 rounded-2xl bg-[#571bc1] px-4 py-3 text-base font-semibold text-[#e9ddff] transition hover:bg-[#6b2fd3]"
          >
            Nueva conversación
          </button>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#8d90a0]">
            History
          </p>
          <div className="space-y-2 text-sm text-[#c3c6d7]">
            <div className="rounded-xl border border-[#434655] bg-[#171f33] p-3 font-medium text-[#dae2fd]">
              Conversación actual
            </div>
            <div className="rounded-xl p-3 text-[#8d90a0]">
              Métricas en vivo
            </div>
            <div className="rounded-xl p-3 text-[#8d90a0]">Historial local</div>
          </div>
          <div className="mt-auto border-t border-[#434655] pt-4">
            <button
              type="button"
              onClick={handleClear}
              className="w-full rounded-xl border border-[#434655] px-3 py-2 text-left text-sm text-[#ffb4ab] transition hover:bg-[#93000a]/20"
            >
              Limpiar historial
            </button>
          </div>
        </aside>

        <main className="flex h-[calc(100dvh-80px)] min-h-0 flex-col">
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-6 md:px-8">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-[#434655] bg-[#131b2e] p-6">
                <h2 className="mb-2 text-lg font-semibold text-[#b4c5ff]">
                  Empezá una conversación
                </h2>
                <p className="text-sm text-[#c3c6d7]">
                  Escribí tu primera consulta. El historial completo se enviará
                  en cada turno para mantener el contexto.
                </p>
              </div>
            )}

            {messages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}-${message.content.slice(0, 20)}`}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b4c5ff] font-bold text-[#002a78]">
                    G
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl border p-4 text-[15px] leading-7 shadow-sm md:max-w-[78%] ${
                    message.role === "user"
                      ? "rounded-tr-md border-[#7a3ce0] bg-[#571bc1] text-[#e9ddff]"
                      : "rounded-tl-md border-[#434655] bg-[#222a3d] text-[#dae2fd]"
                  }`}
                >
                  <p className="whitespace-pre-wrap wrap-break-word">
                    {message.content}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d0bcff] font-bold text-[#3c0091]">
                    U
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#b4c5ff] font-bold text-[#002a78]">
                  G
                </div>
                <div className="flex items-center gap-2 rounded-full border border-[#434655] bg-[#131b2e] px-4 py-2 text-sm italic text-[#c3c6d7]">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#b4c5ff]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#b4c5ff] [animation-delay:120ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#b4c5ff] [animation-delay:220ms]" />
                  <span className="ml-1">Pensando...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-[#ffb4ab]/50 bg-[#93000a]/20 px-4 py-3 text-sm text-[#ffdad6]">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="shrink-0 border-t border-[#434655] bg-[#0b1326]/95 px-4 py-4 backdrop-blur md:px-8">
            <form onSubmit={handleSubmit} className="mx-auto w-full max-w-4xl">
              <div className="rounded-[26px] border border-[#434655] bg-[#222a3d]/90 p-2 shadow-lg backdrop-blur">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Hazme una pregunta..."
                    rows={1}
                    className="max-h-44 min-h-12 w-full resize-y bg-transparent px-4 py-3 text-[#dae2fd] outline-none placeholder:text-[#8d90a0]"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="mb-1 rounded-full bg-[#b4c5ff] p-3 font-semibold text-[#002a78] transition hover:bg-[#c8d4ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between px-2 text-xs text-[#8d90a0]">
                <p>
                  {enterToSend
                    ? "Enter envia · Shift+Enter salto de linea"
                    : "Ctrl/Cmd+Enter envia · Enter salto de linea"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEnterToSend((prev) => !prev)}
                    className="rounded-md px-2 py-1 text-[#c3c6d7] transition hover:bg-[#222a3d]"
                  >
                    {enterToSend ? "Enter envia: ON" : "Enter envia: OFF"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-md px-2 py-1 text-[#c3c6d7] transition hover:bg-[#222a3d] hover:text-[#ffb4ab]"
                  >
                    Borrar conversación
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>

        <aside className="hidden h-[calc(100dvh-80px)] space-y-5 overflow-y-auto border-l border-[#434655] bg-[#171f33] p-5 lg:block">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d90a0]">
              Real-time metrics
            </h3>
            <span className="text-[#b4c5ff]">▣</span>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#434655] bg-[#222a3d] p-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-[#8d90a0]">
                Modelo
              </p>
              <p className="rounded-xl border border-[#434655] bg-[#0b1326] px-3 py-2 font-medium text-[#dae2fd]">
                {lastModel}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-[#434655]/50 pb-2">
                <span className="text-[#8d90a0]">Tiempo de respuesta</span>
                <span>
                  {lastResponseMs !== null ? `${lastResponseMs} ms` : "-"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#434655]/50 pb-2">
                <span className="text-[#8d90a0]">Tokens por segundo</span>
                <span className="text-[#4ae176]">
                  {lastTokensPerSecond !== null
                    ? `${lastTokensPerSecond.toFixed(2)} t/s`
                    : "-"}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-[#8d90a0]">
                Última respuesta
              </p>
              <div className="flex justify-between">
                <span className="text-[#c3c6d7]">Prompt</span>
                <span>{lastUsage.prompt_tokens}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#2d3449]">
                <div
                  className="h-full bg-[#b4c5ff]"
                  style={{ width: `${promptPct}%` }}
                />
              </div>

              <div className="flex justify-between">
                <span className="text-[#c3c6d7]">Completion</span>
                <span>{lastUsage.completion_tokens}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#2d3449]">
                <div
                  className="h-full bg-[#d0bcff]"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              <div className="flex justify-between pt-1 text-base font-semibold">
                <span>Total</span>
                <span>{lastUsage.total_tokens}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#b4c5ff]/20 bg-linear-to-r from-[#b4c5ff]/10 to-transparent p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-[#b4c5ff]/80">
              Totales acumulados
            </p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#c3c6d7]">Prompt total</span>
                <span>{tokenTotals.prompt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c3c6d7]">Completion total</span>
                <span>{tokenTotals.completion}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#dae2fd]">
                <span>Tokens sesión</span>
                <span>{tokenTotals.total}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
