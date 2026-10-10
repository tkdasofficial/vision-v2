import { createFileRoute } from "@tanstack/react-router";
import Page from "@/pages/integrations";
import { Protected } from "@/components/protected";

export const Route = createFileRoute("/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — Vision" },
      { name: "description", content: "Integrations in Vision, your all-in-one AI workspace." },
      { property: "og:title", content: "Integrations — Vision" },
      { property: "og:description", content: "Integrations in Vision, your all-in-one AI workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Protected><Page /></Protected>;
}
