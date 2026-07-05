import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type OutboundChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GroqUsage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

type GroqResponse = {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  usage?: GroqUsage;
  model?: string;
  error?: {
    message?: string;
  };
};

const IA_DIR = path.join(process.cwd(), "ia");
const SYSTEM_PROMPT_FILE = "system-prompt.md";
const ORDERED_KNOWLEDGE_FILES = [
  "empresa.md",
  "faq.md",
  "catalogo.md",
  "politicas.md",
  "contexto.md",
];

const FALLBACK_SYSTEM_PROMPT =
  "Eres el asistente oficial de la empresa. Usa solo la base de conocimiento provista. " +
  "No inventes informacion ni completes con conocimiento general.";

async function readMarkdown(fileName: string) {
  try {
    const fullPath = path.join(IA_DIR, fileName);
    const content = await readFile(fullPath, "utf8");
    return content.trim();
  } catch {
    return "";
  }
}

function resolveKnowledgeFileOrder(fileNames: string[]) {
  const preferred = ORDERED_KNOWLEDGE_FILES.filter((name) =>
    fileNames.includes(name),
  );
  const additional = fileNames
    .filter((name) => !preferred.includes(name))
    .sort((a, b) => a.localeCompare(b));

  return [...preferred, ...additional];
}

async function loadSystemPromptBundle() {
  const files = await readdir(IA_DIR).catch(() => [] as string[]);
  const markdownFiles = files.filter(
    (name) => name.endsWith(".md") && name !== SYSTEM_PROMPT_FILE,
  );

  const orderedKnowledgeFiles = resolveKnowledgeFileOrder(markdownFiles);
  const [systemPromptContent, ...knowledgeContents] = await Promise.all([
    readMarkdown(SYSTEM_PROMPT_FILE),
    ...orderedKnowledgeFiles.map((file) => readMarkdown(file)),
  ]);

  const sections = [systemPromptContent || FALLBACK_SYSTEM_PROMPT];
  orderedKnowledgeFiles.forEach((fileName, index) => {
    const content = knowledgeContents[index];
    if (!content) {
      return;
    }
    sections.push(`## ${fileName}\n${content}`);
  });

  return {
    systemPrompt: sections.join("\n\n").trim(),
    loadedKnowledgeFiles: orderedKnowledgeFiles.filter((_, index) =>
      Boolean(knowledgeContents[index]),
    ),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages?: ChatMessage[];
      includeKnowledge?: boolean;
    };
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Debes enviar un historial de mensajes válido." },
        { status: 400 },
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Falta configurar GROQ_API_KEY en el servidor." },
        { status: 500 },
      );
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const startedAt = Date.now();
    const promptBundle = await loadSystemPromptBundle();

    const outboundMessages: OutboundChatMessage[] = [
      {
        role: "system",
        content: promptBundle.systemPrompt,
      },
      ...messages,
    ];

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: outboundMessages,
          temperature: 0.7,
        }),
      },
    );

    const data = (await groqResponse.json()) as GroqResponse;

    if (!groqResponse.ok) {
      const message =
        data.error?.message ||
        "Groq devolvió un error al procesar la conversación.";
      return NextResponse.json(
        {
          error: message,
          details: `Código ${groqResponse.status}`,
        },
        { status: groqResponse.status },
      );
    }

    const content = data.choices?.[0]?.message?.content;
    const usage = data.usage;
    const resolvedModel = data.model || model;

    if (!content || !usage) {
      return NextResponse.json(
        {
          error: "La respuesta de Groq no incluye contenido o métricas usage.",
        },
        { status: 502 },
      );
    }

    const responseTimeMs = Date.now() - startedAt;
    const tokensPerSecond =
      responseTimeMs > 0
        ? Number(((usage.completion_tokens * 1000) / responseTimeMs).toFixed(2))
        : null;

    return NextResponse.json({
      content,
      usage,
      model: resolvedModel,
      responseTimeMs,
      tokensPerSecond,
      knowledgeLoaded: promptBundle.loadedKnowledgeFiles.length > 0,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud de chat." },
      { status: 500 },
    );
  }
}
