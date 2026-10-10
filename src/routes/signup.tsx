import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address kept working: forwards to /auth/signup with the same query string.
export const Route = createFileRoute("/signup")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/auth/signup", search: search as never, replace: true });
  },
});
