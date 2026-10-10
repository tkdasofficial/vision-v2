import { createFileRoute } from "@tanstack/react-router";
import Page from "@/views/settings/ResetPasswordCode";
import { Protected } from "@/components/Protected";

export const Route = createFileRoute("/app/settings/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Vision" },
      { name: "description", content: "Reset your Vision password with an email code." },
      { property: "og:title", content: "Reset Password — Vision" },
      { property: "og:description", content: "Reset your Vision password with an email code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <Protected><Page /></Protected>;
}
