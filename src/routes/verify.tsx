import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/verify")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/verify" || location.pathname === "/verify/") throw redirect({ to: "/auth/login" });
  },
  component: Outlet,
});
