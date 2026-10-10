import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "@/lib/router-compat";

/** Sign-in pages: signed-in users are sent straight to the main screen. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  if (user) return <Navigate to="/app/new" replace />;
  return <>{children}</>;
}
