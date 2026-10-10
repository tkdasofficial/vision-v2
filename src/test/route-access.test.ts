import { describe, it, expect } from "vitest";
import { classifyRoute, safeReturnPath, loginPathFor } from "@/lib/route-access";

describe("route access rules", () => {
  it("classifies guest-only sign-in pages", () => {
    for (const p of ["/auth/login", "/auth/signup", "/auth/forget-password", "/auth/login/"]) expect(classifyRoute(p)).toBe("guest");
  });
  it("keeps legal, FAQ and verification pages public", () => {
    for (const p of ["/docs/privacy-policy", "/docs/terms-conditions", "/docs/faq", "/auth/verify", "/enterprise", "/google/callback", "/nope"]) expect(classifyRoute(p)).toBe("public");
  });
  it("treats the forgot-password recovery step as recovery", () => {
    expect(classifyRoute("/verify/confirm-password")).toBe("recovery");
  });
  it("protects app, settings, account, admin and onboarding", () => {
    for (const p of ["/app/new", "/app/settings", "/app/settings/security", "/app/settings/reset-password", "/app/account", "/app/chat/x", "/admin", "/admin/users", "/getting-started", "/enterprise/getting-started"]) expect(classifyRoute(p)).toBe("protected");
    expect(classifyRoute("/application")).toBe("public");
  });
  it("only accepts same-site protected return paths", () => {
    expect(safeReturnPath("/app/account")).toBe("/app/account");
    for (const bad of ["//evil.com", "https://evil.com", "/auth/login", "/\\evil", null]) expect(safeReturnPath(bad as any)).toBe("/app/new");
    expect(loginPathFor("/app/account")).toBe("/auth/login?redirect=%2Fapp%2Faccount");
    expect(loginPathFor("/app/new")).toBe("/auth/login");
  });
});
