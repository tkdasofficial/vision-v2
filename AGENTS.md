<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Page UIs live in `src/views/`; each `src/routes/*` file only wraps a view (and `<Protected>` for signed-in pages). Why: keeps ported screens separate from routing.
- Views navigate via `@/lib/router-compat` (thin adapter over TanStack Router). Why: lets ported code keep simple `navigate(path)` calls; never reintroduce react-router-dom.
- Backend is Cloudflare D1 reached from server code only (`src/lib/cloud/*.server.ts`); the browser `supabase`-shaped client in `src/lib/cloud/client.ts` sends every query to one server function that enforces per-table access rules. Why: user chose Cloudflare; keeps view query code unchanged while all permission checks run server-side.
- Sign-in uses PBKDF2 password hashes and hashed session tokens in D1 with an HttpOnly cookie; Google/GitHub OAuth callbacks live at /google/callback and /github/callback. Auth pages live under /auth/* (login, signup, forget-password, verify); password reset is two steps: /auth/verify consumes the code and issues a 10-minute single-use HttpOnly reset ticket (hashed in D1 password_reset_tickets), then /verify/confirm-password spends it. Why: no third-party auth service; tokens never reach browser scripts.
- Google/GitHub OAuth runs in the `auth-gateway/` Cloudflare Worker (`vision` on vision.tusharkantidasofficial.workers.dev), which alone holds provider credentials (Worker secrets), enforces an exact-origin `ALLOWED_RETURN_ORIGINS` allowlist, uses PKCE + sealed state, and returns a 2-minute Ed25519-signed assertion; the app verifies it with the public key in `src/lib/cloud/auth-gateway.ts` (issuer, audience = own origin, nonce cookie, single-use jti in D1). Why: one central callback for every app domain; provider secrets never reach the app or browser. A new app domain only needs adding to the allowlist and redeploying the Worker.
- Chat AI streams from Cloudflare Workers AI via the signed-in-only /api/chat server route, choosing a model per message. Why: user chose Workers AI for LLM only; keys stay on the server.
- Email verification uses 8-digit codes hashed in D1 `auth_otps`, sent via Gmail SMTP (`src/lib/cloud/mail.server.ts`) with the saved Google app password; sender address is discovered from the Drive account and cached in `app_config`. Why: no third-party email service; codes never stored in plain text.
- User files upload to Google Drive per-type sub-folders via `src/lib/cloud/drive.server.ts`; D1 `user_files` holds the record and link, and browsers can only read their own rows (writes are server-only). Why: Drive is the file store, D1 is the index; chats never touch Drive.
- Security logic lives in root `security/` (pure TS, store-agnostic, tested in `security/tests`); `src/lib/cloud/security.server.ts` binds it to D1 and the request, and every signup entry point (email + OAuth) calls `evaluateSignup`. Why: one policy for all entry points; decisions stay server-side and testable without D1.
- Enterprise Login (VISION BDI) state lives in D1 `enterprise_attempts` keyed by an HttpOnly attempt cookie; logic is in `src/lib/cloud/enterprise.server.ts`, domain checks in `security/identity/domain-verification.ts`. Ownership is proven only by a DNS TXT challenge, and OTPs are bound to the attempt. Why: the browser never holds verification results, so steps can't be skipped by direct calls.
