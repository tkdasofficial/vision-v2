import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/settings/Directory";
import { Protected } from "@/components/Protected";

export const Route = createFileRoute("/app/settings/")({
  head: () => ({
    meta: [
      { title: "Settings — Vision" },
      { name: "description", content: "Manage your Vision settings by category." },
      { property: "og:title", content: "Settings — Vision" },
      { property: "og:description", content: "Manage your Vision settings by category." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Protected><Page /></Protected>;
}
