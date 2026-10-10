import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/settings/Notifications";
import { Protected } from "@/components/Protected";

export const Route = createFileRoute("/app/settings/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Vision" },
      { name: "description", content: "Browser notification preferences for Vision." },
      { property: "og:title", content: "Notifications — Vision" },
      { property: "og:description", content: "Browser notification preferences for Vision." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Protected><Page /></Protected>;
}
