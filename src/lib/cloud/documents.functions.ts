import { createServerFn } from "@tanstack/react-start";

// Research documents: owner-only. Not exposed through the generic data query layer.
export const saveDocumentFn = createServerFn({ method: "POST" })
  .inputValidator((input: { title: string; content: string }) => {
    if (!input || typeof input.title !== "string" || typeof input.content !== "string" || !input.content.trim()) throw new Error("Invalid document");
    return { title: input.title.trim().slice(0, 200) || "Research report", content: input.content.slice(0, 200_000) };
  })
  .handler(async ({ data }) => {
    const { assertSameOrigin, currentFacts } = await import("./security.server");
    assertSameOrigin(currentFacts());
    const { requireCaller } = await import("./auth.server");
    const { d1 } = await import("./d1.server");
    const caller = await requireCaller();
    const id = crypto.randomUUID();
    await d1("INSERT INTO research_documents (id, user_id, title, content, created_at) VALUES (?, ?, ?, ?, ?)", [id, caller.user.id, data.title, data.content, Date.now()]);
    return { id, title: data.title };
  });

export type DocumentResult =
  | { status: "ok"; doc: { id: string; title: string; content: string; createdAt: number } }
  | { status: "signin" | "denied" | "missing" };

export const getDocumentFn = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => {
    if (!input || typeof input.id !== "string" || !/^[0-9a-f-]{36}$/i.test(input.id)) throw new Error("Invalid document id");
    return input;
  })
  .handler(async ({ data }): Promise<DocumentResult> => {
    const { getCaller } = await import("./auth.server");
    const { d1 } = await import("./d1.server");
    const caller = await getCaller();
    if (!caller) return { status: "signin" };
    const rows = await d1<any>("SELECT id, user_id, title, content, created_at FROM research_documents WHERE id = ?", [data.id]);
    const row = rows[0];
    if (!row) return { status: "missing" };
    if (row.user_id !== caller.user.id) return { status: "denied" };
    return { status: "ok", doc: { id: row.id, title: row.title, content: row.content, createdAt: row.created_at } };
  });
