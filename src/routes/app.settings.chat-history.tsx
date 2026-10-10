import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/settings/ChatHistory";
import { Protected } from "@/components/Protected";

export const Route = createFileRoute("/app/settings/chat-history")({
  head: () => ({
    meta: [
      { title: "Chat & History — Vision" },
      { name: "description", content: "Export or clear your Vision conversations." },
      { property: "og:title", content: "Chat & History — Vision" },
      { property: "og:description", content: "Export or clear your Vision conversations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Protected><Page /></Protected>;
}
