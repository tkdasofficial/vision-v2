import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { securityStatusFn, changePasswordFn } from "@/lib/cloud/account-security.functions";
import { SettingsPage, SettingsRow, SettingsSection } from "@/components/settings/SettingsUI";

const field = "h-12 w-full rounded-full border border-input bg-transparent px-5 text-sm outline-none focus:ring-2 focus:ring-ring";

export default function Security() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ hasPassword: boolean; providers: string[]; email: string } | null>(null);
  const [cur, setCur] = useState(""); const [next, setNext] = useState(""); const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { securityStatusFn().then(setStatus).catch(() => toast.error("Couldn't load security info.")); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== again) return toast.error("New passwords don't match.");
    setBusy(true);
    try {
      const r = await changePasswordFn({ data: { current: cur, next } });
      if (r.error) toast.error(r.error); else { toast.success("Password changed. Other devices were signed out."); setCur(""); setNext(""); setAgain(""); }
    } catch { toast.error("Couldn't change password."); }
    setBusy(false);
  };

  return (
    <SettingsPage title="Security" loading={!status}>
      {status && (
        <>
          <SettingsSection title="Sign-in methods">
            <SettingsRow label="Email" hint={status.email} />
            {status.providers.map((p) => <SettingsRow key={p} label={p[0].toUpperCase() + p.slice(1)} hint="Connected" />)}
          </SettingsSection>
          {status.hasPassword ? (
            <SettingsSection title="Change password" description="Changing it signs you out on other devices.">
              <form onSubmit={submit} className="space-y-3">
                <input className={field} type="password" autoComplete="current-password" placeholder="Current password" aria-label="Current password" value={cur} onChange={(e) => setCur(e.target.value)} required />
                <input className={field} type="password" autoComplete="new-password" placeholder="New password (8+ characters)" aria-label="New password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required />
                <input className={field} type="password" autoComplete="new-password" placeholder="Confirm new password" aria-label="Confirm new password" value={again} onChange={(e) => setAgain(e.target.value)} required />
                <button disabled={busy} className="h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? "Saving…" : "Change password"}</button>
              </form>
              <button onClick={() => navigate("/auth/forget-password")} className="flex items-center gap-2 px-1 text-sm text-muted-foreground hover:text-foreground"><KeyRound className="w-4 h-4" />Forgot your password? Reset it by email</button>
            </SettingsSection>
          ) : (
            <SettingsSection title="Password" description="You sign in with Google or GitHub, so there's no VISION password to manage." />
          )}
          <SettingsSection title="Two-step sign-in" description="Authenticator app and email codes are coming soon. Your account is protected by email verification and sign-in limits today.">
            <SettingsRow label="Authenticator app" hint="Not available yet" />
            <SettingsRow label="Email code" hint="Not available yet" />
          </SettingsSection>
        </>
      )}
    </SettingsPage>
  );
}
