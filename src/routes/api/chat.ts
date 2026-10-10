import { createFileRoute } from "@tanstack/react-router";

// Vision model plan: each task has a primary and a fallback model.
// Keys are read from server env only (GROQ_API_KEY, NVIDIA_API_KEY, CLOUDFLARE_*).
type Target = { provider: "groq" | "nvidia" | "cf"; model: string };
const PLAN: Record<string, Target[]> = {
  fast: [{ provider: "groq", model: "openai/gpt-oss-20b" }, { provider: "cf", model: "@cf/openai/gpt-oss-20b" }],
  deep: [{ provider: "groq", model: "openai/gpt-oss-120b" }, { provider: "nvidia", model: "nvidia/nemotron-3-super-120b-a12b" }],
  code: [{ provider: "cf", model: "@cf/moonshotai/kimi-k2.7-code" }, { provider: "cf", model: "@cf/qwen/qwen2.5-coder-32b-instruct" }],
  media: [{ provider: "nvidia", model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning" }],
};

const SYSTEM = "You are Vision, a helpful, concise AI assistant. Format answers in Markdown.";

function pickTask(text: string, hasMedia: boolean, toolId?: string) {
  if (hasMedia) return "media";
  if (toolId?.includes("code") || /```|\b(code|function|bug|debug|typescript|javascript|python|react|sql|regex|api)\b/i.test(text)) return "code";
  if (text.length > 1200 || /\b(analy[sz]e|research|explain in detail|step[- ]by[- ]step|compare|plan|prove|reason)\b/i.test(text)) return "deep";
  return "fast";
}

function endpoint(t: Target): { url: string; key?: string } {
  if (t.provider === "groq") return { url: "https://api.groq.com/openai/v1/chat/completions", key: process.env["GROQ_API_KEY"] };
  if (t.provider === "nvidia") return { url: "https://integrate.api.nvidia.com/v1/chat/completions", key: process.env["NVIDIA_API_KEY"] };
  const account = process.env["CLOUDFLARE_ACCOUNT_ID"];
  return { url: `https://api.cloudflare.com/client/v4/accounts/${account}/ai/v1/chat/completions`, key: account ? process.env["CLOUDFLARE_API_TOKEN"] : undefined };
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        {
          const { factsFrom, assertSameOrigin } = await import("@/lib/cloud/security.server");
          try { assertSameOrigin(factsFrom(request.headers, null)); } catch (e: any) { return Response.json({ error: e.message }, { status: 403 }); }
        }
        const { getCaller } = await import("@/lib/cloud/auth.server");
        const caller = await getCaller();
        if (!caller) return Response.json({ error: "Please sign in to chat." }, { status: 401 });
        {
          const { d1Store } = await import("@/lib/cloud/security.server");
          const { enforceLimits, SECURITY_CONFIG } = await import("../../../security");
          try { await enforceLimits(d1Store, [[`chat:user:${caller.user.id}`, SECURITY_CONFIG.limits.chatPerUser]]); }
          catch (e: any) { return Response.json({ error: e.message }, { status: 429 }); }
        }

        const body: any = await request.json().catch(() => null);
        const raw = Array.isArray(body?.messages) ? body.messages.slice(-30) : [];
        let hasMedia = false;
        const messages = raw
          .map((m: any) => {
            const role = m.role === "assistant" ? "assistant" : "user";
            if (typeof m.content === "string") return { role, content: m.content.slice(0, 20000) };
            if (!Array.isArray(m.content)) return { role, content: "" };
            const text = m.content.filter((p: any) => p.type === "text").map((p: any) => String(p.text ?? "")).join("\n").slice(0, 20000);
            const images = role === "user"
              ? m.content.filter((p: any) => p.type === "image_url" && typeof p.image_url?.url === "string").slice(0, 4)
              : [];
            if (!images.length) return { role, content: text };
            hasMedia = true;
            return { role, content: [{ type: "text", text }, ...images.map((p: any) => ({ type: "image_url", image_url: { url: p.image_url.url } }))] };
          })
          .filter((m: any) => (typeof m.content === "string" ? m.content.trim() : m.content.length));
        if (!messages.length) return Response.json({ error: "Message is empty." }, { status: 400 });

        const last = messages[messages.length - 1].content;
        const lastText = typeof last === "string" ? last : last.map((p: any) => p.text ?? "").join(" ");
        const task = pickTask(lastText, hasMedia, body?.toolId);

        let lastStatus = 502;
        for (const t of PLAN[task]) {
          const { url, key } = endpoint(t);
          if (!key) continue;
          const upstream = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: t.model, messages: [{ role: "system", content: SYSTEM }, ...messages], stream: true, max_tokens: 4096 }),
            signal: request.signal,
          }).catch((e) => { console.error("[chat]", t.provider, e?.message); return null; });
          if (upstream?.ok && upstream.body) {
            return new Response(upstream.body, {
              headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-store", "X-Vision-Model": t.model },
            });
          }
          if (upstream) {
            lastStatus = upstream.status;
            console.error("[chat]", t.provider, t.model, upstream.status, (await upstream.text().catch(() => "")).slice(0, 300));
          }
        }
        const status = lastStatus === 429 ? 429 : 502;
        return Response.json({ error: status === 429 ? "AI is busy right now. Please try again in a moment." : "AI couldn't answer right now." }, { status });
      },
    },
  },
});
