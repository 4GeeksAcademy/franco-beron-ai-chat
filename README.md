# Asistente Empresarial con Groq

Proyecto web de chat construido con Next.js, React y TypeScript.

El sistema esta orientado a atencion empresarial y responde usando una base de conocimiento local en Markdown, con reglas estrictas para evitar respuestas fuera de dominio.

## Que puede hacer

- Responder consultas sobre la empresa, servicios, catalogo, FAQ y politicas.
- Mantener historial conversacional en el cliente.
- Mostrar metricas por respuesta y acumuladas:
  - tokens de prompt
  - tokens de completion
  - total tokens
  - tiempo de respuesta
  - tokens por segundo
- Persistir localmente el estado de la conversacion y metricas.
- Enviar mensajes con Enter o con Ctrl/Cmd+Enter, configurable desde la UI.

## Que no debe hacer

- No responder preguntas de cultura general o fuera del negocio.
- No inventar precios, plazos ni informacion no confirmada.
- No completar datos usando conocimiento propio del modelo.

## Stack tecnico

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- API de Groq compatible con formato OpenAI Chat Completions

## Arquitectura funcional

1. El frontend envia el historial de mensajes al endpoint de chat.
2. La API arma un mensaje de sistema combinando archivos de conocimiento de la carpeta ia.
3. Se envia a Groq:
   - primer mensaje role system con reglas y conocimiento
   - historial de mensajes del usuario/asistente
4. La API devuelve contenido y metricas.
5. El frontend actualiza vista, historial y panel de metricas.

## Base de conocimiento

La carpeta ia contiene el conocimiento del negocio:

- ia/system-prompt.md
- ia/empresa.md
- ia/faq.md
- ia/catalogo.md
- ia/politicas.md
- ia/contexto.md

Orden de carga:

1. system-prompt.md
2. empresa.md
3. faq.md
4. catalogo.md
5. politicas.md
6. contexto.md

Extensibilidad:

- Cualquier archivo .md nuevo en ia se agrega automaticamente al prompt.
- No hace falta tocar la logica principal para ampliar conocimiento.

## Reglas de respuesta empresariales

Definidas en ia/system-prompt.md.

Mensajes obligatorios:

- Si la consulta es fuera del negocio:
  - Este asistente está diseñado exclusivamente para responder consultas sobre nuestra empresa, productos y servicios.
- Si la consulta es del negocio pero no existe en la base:
  - No dispongo de esa información confirmada. Un asesor podrá ayudarte con esa consulta.

## Estructura del proyecto

```text
.
├── ia/
│   ├── system-prompt.md
│   ├── empresa.md
│   ├── faq.md
│   ├── catalogo.md
│   ├── politicas.md
│   └── contexto.md
├── src/
│   └── app/
│       ├── api/chat/route.ts
│       ├── layout.tsx
│       └── page.tsx
├── public/
├── package.json
└── README.md
```

## Variables de entorno

Configurar en .env o .env.local:

- GROQ_API_KEY (obligatoria)
- GROQ_MODEL (opcional, default: llama-3.1-8b-instant)

Ejemplo:

```env
GROQ_API_KEY=tu_api_key
GROQ_MODEL=llama-3.1-8b-instant
```

## Instalacion y ejecucion

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar en desarrollo:

```bash
npm run dev
```

3. Abrir en navegador:

```text
http://localhost:3000
```

## Scripts disponibles

- npm run dev: levanta el entorno de desarrollo
- npm run build: genera build de produccion
- npm run start: ejecuta la app en modo produccion
- npm run lint: ejecuta ESLint

## Endpoint principal

- POST /api/chat

Body esperado:

```json
{
  "messages": [{ "role": "user", "content": "Hola" }]
}
```

Respuesta:

```json
{
  "content": "...",
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  },
  "model": "llama-3.1-8b-instant",
  "responseTimeMs": 0,
  "tokensPerSecond": 0,
  "knowledgeLoaded": true
}
```

## Persistencia en cliente

Se almacena en localStorage:

- historial de mensajes
- metricas de ultima respuesta
- metricas acumuladas
- ultimo modelo usado
- preferencia de envio con Enter

Y en sessionStorage:

- bandera de sesion para estado de conocimiento

## Buenas practicas para actualizar conocimiento

1. Editar contenido en ia/\*.md.
2. Mantener textos concretos, sin ambiguedad.
3. Evitar datos no confirmados.
4. Si cambia una politica, actualizar politicas.md y contexto.md.
5. Validar con preguntas de control:
   - fuera de dominio (ej: historia, matematica)
   - dentro de dominio con dato existente
   - dentro de dominio sin dato existente

## Troubleshooting rapido

- Error de API key:
  - verificar GROQ_API_KEY en .env/.env.local.
- Respuesta fuera de dominio no bloqueada:
  - revisar reglas y ejemplos en ia/system-prompt.md.
- Informacion empresarial incompleta:
  - actualizar ia/empresa.md, ia/faq.md, ia/catalogo.md o ia/politicas.md.
- Puerto ocupado al correr dev:
  - Next puede usar 3001 automaticamente o cerrar el proceso en 3000.

## Estado actual

El proyecto esta preparado para funcionar como asistente empresarial de Constructora Isopanel con control de dominio, respuesta guiada por base de conocimiento y metricas operativas en tiempo real.
