# VISION — All-in-one AI Workspace

VISION is a full-stack AI chat workspace built with **TanStack Start (React 19, Vite 7)** and deployed on **Cloudflare Workers**. Data lives in **Cloudflare D1**, files in **Google Drive**, and AI runs on **Groq, NVIDIA and Cloudflare Workers AI**.

## App summary

### Authentication & security
- Email + password sign-up/login (PBKDF2 hashes), 8-digit email verification codes sent via Gmail SMTP.
- Google & GitHub sign-in through a central Cloudflare Worker gateway (`auth-gateway/`, deployed as `vision.tusharkantidasofficial.workers.dev`): PKCE, sealed state, exact-origin allowlist, Ed25519-signed single-use assertions.
- Sessions: hashed tokens in D1, HttpOnly cookie, 30-day sliding renewal, login history (device + IP, pruned after 180 days), same-origin checks on every state-changing call.
- Forgot Password (signed-out: `/auth/forget-password` → `/auth/verify` → `/verify/confirm-password`) and Reset Password (signed-in: Settings → Security, stays signed in, other devices signed out).
- Central route guard (`src/lib/route-access.ts` + `RouteGuard`): public, guest-only, protected and recovery pages; no flash of private content; network hiccups retry instead of signing out.
- Signup security pipeline in `security/` (bot detection, rate limits, risk scoring, disposable-email checks, audit log), tested in `security/tests`.
- Enterprise Login (VISION BDI) with DNS TXT domain ownership proof.

### AI chat
- Four modes: **Default, Deep Thinking, Research, Coding**, with an automatic per-message task router in Default.
- Streaming replies from `/api/chat`; up to 3 model fallbacks per mode; self-verification for hard questions; image understanding.
- Research mode searches the web (Wikipedia + DuckDuckGo), cites sources and saves reports as documents (`/app/doc/$docId`, PDF download).
- Code replies render in code boxes with copy, full-screen view and download.
- Incognito chats (not saved), chat history, export and delete.

### Pages
- Main chat (`/app/new`, `/app/chat/$chatId`), Search, Library, Projects, Images, Videos, Inbox, Integrations, Prospecting, Support, Upgrade, Account.
- Settings directory with 9 sub-pages: Appearance, Language, AI Preferences, Chat & History, Privacy & Data, Security, Accessibility, Notifications, About VISION.
- Admin area: dashboard, users, analytics, announcements, audit, feature flags, reports, subscriptions, support, system.
- Public: Login, Sign up, Forgot password, Privacy Policy, Terms of Service, FAQ.
- Light (#F5F5F5) and dark (#080808) themes following the device, with accent, text-size and accessibility options.

### Known open items
- Plans & Pricing list is empty; two-step sign-in not built; notification alerts saved but not sent; web search limited to Wikipedia/DuckDuckGo; About version "1.0.0" is a placeholder.

## Development

```sh
bun install
bun run dev      # local dev server
bun run test     # run tests
bun run build    # production build
```

Database schema: `db/schema.sql` (apply with `wrangler d1 execute vision --remote --file db/schema.sql`). Secrets (Groq, NVIDIA, Google app password, Cloudflare) are server-side only; `.env` is not included in the download.

## Folder structure

```text
vision/
├── .workspace/
├── auth-gateway/
│   ├── src/
│   │   └── index.ts
│   └── wrangler.toml
├── db/
│   └── schema.sql
├── public/
│   ├── favicon.ico
│   ├── og-icon.png
│   └── robots.txt
├── security/
│   ├── antibot/
│   │   └── bot-detection.ts
│   ├── audit/
│   │   └── audit-logger.ts
│   ├── cookies/
│   │   └── csrf.ts
│   ├── core/
│   │   └── signup-pipeline.ts
│   ├── credits/
│   │   └── initial-credit-grant.ts
│   ├── enforcement/
│   │   └── restrictions.ts
│   ├── identity/
│   │   ├── dns.ts
│   │   ├── domain-verification.ts
│   │   └── email.ts
│   ├── network/
│   │   └── ip.ts
│   ├── rate-limits/
│   │   └── rate-limit-engine.ts
│   ├── risk/
│   │   └── risk-engine.ts
│   ├── storage/
│   │   └── memory-store.ts
│   ├── tests/
│   │   └── security.test.ts
│   ├── utils/
│   │   └── crypto.ts
│   ├── config.ts
│   ├── index.ts
│   └── types.ts
├── src/
│   ├── assets/
│   │   ├── logo.svg
│   │   ├── reference-1.jpg
│   │   ├── reference-2.jpg
│   │   ├── reference-3.jpg
│   │   ├── reference-4.jpg
│   │   ├── reference-5.jpg
│   │   ├── reference-6.jpg
│   │   ├── reference-7.jpg
│   │   └── reference-8.jpg
│   ├── components/
│   │   ├── ai-elements/
│   │   │   └── prompt-input.tsx
│   │   ├── chat/
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── FullScreenCodeView.tsx
│   │   │   └── useCopy.ts
│   │   ├── icons/
│   │   │   └── IncognitoIcon.tsx
│   │   ├── settings/
│   │   │   └── SettingsUI.tsx
│   │   ├── story/
│   │   │   └── StoryFlowCard.tsx
│   │   ├── ui/
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input-group.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── spinner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── toggle-group.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── tooltip.tsx
│   │   ├── AgentProgressCard.tsx
│   │   ├── AnnouncementBanner.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatWorkspace.tsx
│   │   ├── CreationEmptyState.tsx
│   │   ├── DesktopSidebar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FileConverterCard.tsx
│   │   ├── FileCreatorCard.tsx
│   │   ├── MobileSidebar.tsx
│   │   ├── ModeSelector.tsx
│   │   ├── PageHeader.tsx
│   │   ├── ProfileMenu.tsx
│   │   ├── Protected.tsx
│   │   ├── RouteGuard.tsx
│   │   ├── SidebarActions.tsx
│   │   ├── SidebarFeatures.tsx
│   │   ├── TTSCard.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── VideoEditorCard.tsx
│   │   ├── VideoGenerationCard.tsx
│   │   ├── WebAppPreviewCard.tsx
│   │   ├── WorkspaceShell.tsx
│   │   └── ZipAnalysisCard.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ChatHistoryContext.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useBackgroundTasks.ts
│   │   └── useSettings.ts
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── models.server.ts
│   │   │   ├── modes.ts
│   │   │   ├── prompts.server.ts
│   │   │   ├── providers.server.ts
│   │   │   └── task-router.ts
│   │   ├── cloud/
│   │   │   ├── account-security.functions.ts
│   │   │   ├── auth-gateway.ts
│   │   │   ├── auth.functions.ts
│   │   │   ├── auth.server.ts
│   │   │   ├── chat-stream.ts
│   │   │   ├── client.ts
│   │   │   ├── d1.server.ts
│   │   │   ├── data.functions.ts
│   │   │   ├── documents.functions.ts
│   │   │   ├── drive.server.ts
│   │   │   ├── enterprise.functions.ts
│   │   │   ├── enterprise.server.ts
│   │   │   ├── mail.server.ts
│   │   │   ├── oauth-urls.ts
│   │   │   ├── oauth.server.ts
│   │   │   ├── otp.server.ts
│   │   │   ├── query-types.ts
│   │   │   ├── query.server.ts
│   │   │   ├── schema.server.ts
│   │   │   └── security.server.ts
│   │   ├── search/
│   │   │   └── search.server.ts
│   │   ├── admin-audit.ts
│   │   ├── agent-executor.ts
│   │   ├── append-transcript.ts
│   │   ├── chunk-recovery.ts
│   │   ├── code-files.ts
│   │   ├── creation-references.ts
│   │   ├── detect-aspect-ratio.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── ffmpeg-renderer.ts
│   │   ├── file-converter.ts
│   │   ├── long-form-pipeline.ts
│   │   ├── lovable-error-reporting.ts
│   │   ├── onboarding-options.ts
│   │   ├── project-options.ts
│   │   ├── research-pdf.ts
│   │   ├── route-access.ts
│   │   ├── router-compat.tsx
│   │   ├── settings.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   ├── video-editor-engine.ts
│   │   ├── video-pipeline.ts
│   │   ├── web-preview-engine.ts
│   │   ├── workspace-search.test.ts
│   │   ├── workspace-search.ts
│   │   ├── zip-analyzer.ts
│   │   └── zip-export.ts
│   ├── routes/
│   │   ├── api/
│   │   │   ├── auth.$provider.ts
│   │   │   ├── chat.ts
│   │   │   └── files.ts
│   │   ├── README.md
│   │   ├── __root.tsx
│   │   ├── admin.analytics.tsx
│   │   ├── admin.announcements.tsx
│   │   ├── admin.audit.tsx
│   │   ├── admin.background-tasks.tsx
│   │   ├── admin.chat-sessions.tsx
│   │   ├── admin.dashboard.tsx
│   │   ├── admin.feature-flags.tsx
│   │   ├── admin.index.tsx
│   │   ├── admin.notifications.tsx
│   │   ├── admin.reports.tsx
│   │   ├── admin.subscriptions.tsx
│   │   ├── admin.support.tsx
│   │   ├── admin.system.tsx
│   │   ├── admin.tsx
│   │   ├── admin.users.tsx
│   │   ├── app.account.tsx
│   │   ├── app.chat.$chatId.tsx
│   │   ├── app.doc.$docId.tsx
│   │   ├── app.images.tsx
│   │   ├── app.inbox.tsx
│   │   ├── app.incognito.tsx
│   │   ├── app.integrations.tsx
│   │   ├── app.library.tsx
│   │   ├── app.new.tsx
│   │   ├── app.project-create.tsx
│   │   ├── app.projects.tsx
│   │   ├── app.prospecting.tsx
│   │   ├── app.search.tsx
│   │   ├── app.settings.about.tsx
│   │   ├── app.settings.accessibility.tsx
│   │   ├── app.settings.ai-preferences.tsx
│   │   ├── app.settings.appearance.tsx
│   │   ├── app.settings.chat-history.tsx
│   │   ├── app.settings.index.tsx
│   │   ├── app.settings.language.tsx
│   │   ├── app.settings.notifications.tsx
│   │   ├── app.settings.privacy-data.tsx
│   │   ├── app.settings.reset-password.tsx
│   │   ├── app.settings.security.tsx
│   │   ├── app.settings.tsx
│   │   ├── app.support.tsx
│   │   ├── app.upgrade.tsx
│   │   ├── app.videos.tsx
│   │   ├── auth.forget-password.tsx
│   │   ├── auth.login.tsx
│   │   ├── auth.signup.tsx
│   │   ├── auth.tsx
│   │   ├── auth.verify.tsx
│   │   ├── docs.faq.tsx
│   │   ├── docs.privacy-policy.tsx
│   │   ├── docs.terms-conditions.tsx
│   │   ├── enterprise.email.tsx
│   │   ├── enterprise.getting-started.tsx
│   │   ├── enterprise.tsx
│   │   ├── enterprise.verify.tsx
│   │   ├── forgot-password.tsx
│   │   ├── getting-started.tsx
│   │   ├── github.callback.ts
│   │   ├── google.callback.ts
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── reset-password.tsx
│   │   ├── signup.tsx
│   │   ├── verify.confirm-password.tsx
│   │   └── verify.tsx
│   ├── test/
│   │   ├── app-routing.test.tsx
│   │   ├── append-transcript.test.ts
│   │   ├── auth-gateway.test.ts
│   │   ├── creation-empty-state.test.tsx
│   │   ├── empty-state.test.tsx
│   │   ├── enterprise-login.test.ts
│   │   ├── example.test.ts
│   │   ├── oauth-providers.test.ts
│   │   ├── otp-drive.test.ts
│   │   ├── route-access.test.ts
│   │   ├── security-integration.test.ts
│   │   ├── setup.ts
│   │   └── task-router.test.ts
│   ├── types/
│   │   └── cloudflare-sockets.d.ts
│   ├── views/
│   │   ├── admin/
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Announcements.tsx
│   │   │   ├── AuditLog.tsx
│   │   │   ├── BackgroundTasks.tsx
│   │   │   ├── ChatSessions.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── FeatureFlags.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Subscriptions.tsx
│   │   │   ├── Support.tsx
│   │   │   ├── SystemSettings.tsx
│   │   │   └── Users.tsx
│   │   ├── settings/
│   │   │   ├── About.tsx
│   │   │   ├── AccessibilitySettings.tsx
│   │   │   ├── AiPreferences.tsx
│   │   │   ├── Appearance.tsx
│   │   │   ├── ChatHistory.tsx
│   │   │   ├── Directory.tsx
│   │   │   ├── Language.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── PrivacyData.tsx
│   │   │   ├── ResetPasswordCode.tsx
│   │   │   └── Security.tsx
│   │   ├── Account.tsx
│   │   ├── Auth.tsx
│   │   ├── DocumentPreview.tsx
│   │   ├── EnterpriseGettingStarted.tsx
│   │   ├── EnterpriseLogin.tsx
│   │   ├── Faq.tsx
│   │   ├── GettingStarted.tsx
│   │   ├── Inbox.tsx
│   │   ├── Index.tsx
│   │   ├── Integrations.tsx
│   │   ├── Library.tsx
│   │   ├── Privacy.tsx
│   │   ├── ProjectCreate.tsx
│   │   ├── Projects.tsx
│   │   ├── Prospecting.tsx
│   │   ├── ResetPassword.tsx
│   │   ├── Search.tsx
│   │   ├── Support.tsx
│   │   ├── Terms.tsx
│   │   ├── Upgrade.tsx
│   │   └── VerifyEmail.tsx
│   ├── AGENTS.md
│   ├── routeTree.gen.ts
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   ├── styles.css
│   └── vite-env.d.ts
├── .gitignore
├── .prettierignore
├── .prettierrc
├── AGENTS.md
├── README.md
├── bun.lock
├── bunfig.toml
├── components.json
├── eslint.config.js
├── package.json
├── roadmap.md
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── vite.config.ts
└── vitest.config.ts
```
