import { createFileRoute, redirect } from "@tanstack/react-router";

// Old reset address: the reset flow now starts at /auth/forget-password.
export const Route = createFileRoute("/reset-password")({
  beforeLoad: () => {
    throw redirect({ to: "/auth/forget-password", replace: true });
  },
});
