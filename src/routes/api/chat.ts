import { createFileRoute } from "@tanstack/react-router";
import { normalizeMode } from "@/lib/ai/modes";
import { classifyTask } from "@/lib/ai/task-router";

// Orchestrator: auth + validation, then Task Router → model candidates → provider stream.
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
        let lastHasMedia = false;
        const messages = raw
          .map((m: any, i: number) => {
            const role = m.role === "assistant" ? "assistant" : "user";
            if (typeof m.content === "string") return { role, content: m.content.slice(0, 20000) };
            if (!Array.isArray(m.content)) return { role, content: "" };
            const text = m.content.filter((p: any) => p.type === "text").map((p: any) => String(p.text ?? "")).join("\n").slice(0, 20000);
            const images = role === "user" && i === raw.length - 1
              ? m.content.filter((p: any) => p.type === "image_url" && typeof p.image_url?.url === "string").slice(0, 4)
              : [];
            if (!images.length) return { role, content: text };
            lastHasMedia = true;
            return { role, content: [{ type: "text", text }, ...images.map((p: any) => ({ type: "image_url", image_url: { url: p.image_url.url } }))] };
          })
          .filter((m: any) => (typeof m.content === "string" ? m.content.trim() : m.content.length));
        if (!messages.length) return Response.json({ error: "Message is empty." }, { status: 400 });

        const last = messages[messages.length - 1].content;
        const lastText = typeof last === "string" ? last : last.map((p: any) => p.text ?? "").join(" ");
        const legacyCoding = typeof body?.toolId === "string" && body.toolId.includes("code");
        const mode = legacyCoding ? "coding" : normalizeMode(body?.mode);
        const task = classifyTask({ text: lastText, mode, hasMedia: lastHasMedia });

        const { candidatesFor } = await import("@/lib/ai/models.server");
        const { streamFromProvider } = await import("@/lib/ai/providers.server");
        const { systemPromptFor } = await import("@/lib/ai/prompts.server");
        const deep = task.executionMode !== "default";
        const fullMessages = [{ role: "system", content: systemPromptFor(task) }, ...messages];

        let lastStatus = 502;
        for (const t of candidatesFor(task)) {
          const r = await streamFromProvider(t, fullMessages, { maxTokens: deep ? 8192 : 4096, deep }, request.signal);
          if (r.ok) {
            return new Response(r.body, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-store",
                "X-Vision-Model": t.label,
                "X-Vision-Execution": task.executionMode,
                "X-Vision-Output": task.output,
              },
            });
          }
          if (r.status === 499) return new Response(null, { status: 499 });
          lastStatus = r.status;
          console.error("[chat]", t.provider, t.model, r.status, r.reason);
          // Auth/permission problems won't fix themselves on retry; try the next provider instead.
        }
        const status = lastStatus === 429 ? 429 : 502;
        return Response.json({ error: status === 429 ? "AI is busy right now. Please try again in a moment." : "AI couldn't answer right now." }, { status });
      },
    },
  },
});
