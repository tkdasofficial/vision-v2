import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router-compat";
import { securityStatusFn } from "@/lib/cloud/account-security.functions";
import { requestPasswordResetFn, verifyResetCodeFn, completePasswordResetFn } from "@/lib/cloud/auth.functions";
import { SettingsPage } from "@/components/settings/SettingsUI";

const field = "h-14 w-full rounded-full border border-input bg-transparent px-5 text-sm outline-none focus:ring-2 focus:ring-ring";
const primary = "h-14 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground disabled:opacity-50";

/** Signed-in password reset: email code → new password, without signing this device out. */
export default function ResetPasswordCode() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [step, setStep] = useState<"send" | "code" | "password">("send");
  const [code, setCode] = useState(""); const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { securityStatusFn().then((s) => setEmail(s.email)).catch(() => toast.error("Couldn't load your account.")); }, []);

  const send = async () => {
    if (!email) return;
    setBusy(true);
    try {
      const r = await requestPasswordResetFn({ data: { email } });
      if (r.error) toast.error(r.error); else { toast.success("Code sent to your email."); setStep("code"); }
    } catch { toast.error("Couldn't send the code."); }
    setBusy(false);
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault(); if (!email) return;
    setBusy(true);
    try {
      const r = await verifyResetCodeFn({ data: { email, code } });
      if (r.error) toast.error(r.error); else setStep("password");
    } catch { toast.error("Couldn't check the code."); }
    setBusy(false);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return toast.error("Passwords don't match.");
    setBusy(true);
    try {
      const r = await completePasswordResetFn({ data: { password: pw } });
      if (r.error) { toast.error(r.error); setBusy(false); return; }
      toast.success("Password changed.");
      navigate("/app/new");
    } catch { toast.error("Couldn't change the password."); setBusy(false); }
  };

  return (
    <SettingsPage title="Reset password" backTo="/app/settings/security" loading={!email}>
      <div className="space-y-2">
        <input className={`${field} text-muted-foreground`} value={email ?? ""} readOnly aria-label="Email" />
        {step === "send" && <button onClick={send} disabled={busy} className={primary}>{busy ? "Sending…" : "Send code"}</button>}
        {step === "code" && (
          <form onSubmit={verify} className="space-y-2">
            <input className={`${field} tracking-[0.3em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={8} placeholder="8-digit code" aria-label="Code"
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required autoFocus />
            <button disabled={busy || code.length !== 8} className={primary}>{busy ? "Checking…" : "Confirm code"}</button>
            <button type="button" onClick={send} disabled={busy} className="h-12 w-full rounded-full text-sm text-muted-foreground hover:text-foreground">Resend code</button>
          </form>
        )}
        {step === "password" && (
          <form onSubmit={save} className="space-y-2">
            <input className={field} type="password" autoComplete="new-password" minLength={8} placeholder="New password" aria-label="New password" value={pw} onChange={(e) => setPw(e.target.value)} required autoFocus />
            <input className={field} type="password" autoComplete="new-password" minLength={8} placeholder="Confirm password" aria-label="Confirm password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
            <button disabled={busy} className={primary}>{busy ? "Saving…" : "Change password"}</button>
          </form>
        )}
      </div>
    </SettingsPage>
  );
}
