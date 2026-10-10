import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { SettingsPage, SettingsRow, SettingsSection } from "@/components/settings/SettingsUI";

const links = [
  { to: "/app/support", label: "Help & Support" },
  { to: "/docs/terms-conditions", label: "Terms of Service" },
  { to: "/docs/privacy-policy", label: "Privacy Policy" },
] as const;

export default function About() {
  return (
    <SettingsPage title="About VISION">
      <SettingsSection title="VISION" description="Your all-in-one AI workspace.">
        <SettingsRow label="Version" hint="1.0.0" />
      </SettingsSection>
      <SettingsSection title="Help & legal">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="flex items-center justify-between rounded-2xl border border-border px-5 py-4 text-sm font-medium hover:bg-accent">
            {l.label}<ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </SettingsSection>
    </SettingsPage>
  );
}
