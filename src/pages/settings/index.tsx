import { Link } from "@tanstack/react-router";
import { Palette, Languages, Sparkles, MessagesSquare, Database, ShieldCheck, Accessibility, Bell, Info, ChevronRight } from "lucide-react";
import PageHeader from "@/components/page-header";

export const SETTINGS_CATEGORIES = [
  { to: "/app/settings/appearance", icon: Palette, title: "Appearance", desc: "Theme, accent colour and text size" },
  { to: "/app/settings/language", icon: Languages, title: "Language", desc: "Interface language" },
  { to: "/app/settings/ai-preferences", icon: Sparkles, title: "AI Preferences", desc: "Default mode, answer style, custom instructions" },
  { to: "/app/settings/chat-history", icon: MessagesSquare, title: "Chat & History", desc: "Export or clear conversations" },
  { to: "/app/settings/privacy-data", icon: Database, title: "Privacy & Data", desc: "Your data, research documents and deletion" },
  { to: "/app/settings/security", icon: ShieldCheck, title: "Security", desc: "Password and two-step sign-in" },
  { to: "/app/settings/accessibility", icon: Accessibility, title: "Accessibility", desc: "Motion, contrast and tap size" },
  { to: "/app/settings/notifications", icon: Bell, title: "Notifications", desc: "Browser alerts" },
  { to: "/app/settings/about", icon: Info, title: "About VISION", desc: "Version, help and legal" },
] as const;

export default function SettingsDirectory() {
  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <PageHeader title="Settings" backTo="/app/new" />
      <div className="flex-1 px-4 pt-2 pb-12 overflow-y-auto">
        <nav aria-label="Settings categories" className="max-w-lg mx-auto space-y-2">
          {SETTINGS_CATEGORIES.map(({ to, icon: Icon, title }) => (
            <Link key={to} to={to} className="flex items-center gap-4 rounded-full border border-border px-5 py-4 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-medium text-foreground">{title}</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
