import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address kept working: forwards to /auth/forget-password with the same query string.
export const Route = createFileRoute("/forgot-password")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/auth/forget-password", search: search as never, replace: true });
  },
});
