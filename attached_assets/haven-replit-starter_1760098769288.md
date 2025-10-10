# WholeWellness‑Coaching WebSite — Full‑Stack Audit
Date: 2025-10-10 11:30 UTC

> Scope: front‑end UX/performance/accessibility/SEO, back‑end/security/config, deployment (Replit/Vercel/Cloud Run), monitoring, and a prioritized action plan.

---


## 0) Repo signals observed
- Monorepo style with `client/`, `server/`, `shared/` plus deployment scripts and tests.
- Tooling & configs present: `vite.config.ts/js`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`, `drizzle.config.ts`.
- Deployment helpers: `deploy.sh`, `deploy-cloud-run.sh`, `fix-asset-deployment.sh`, `start.cjs`, `start-health-only.cjs`, `test-*` scripts.
- Docs & runbooks: multiple `*_SUMMARY.md`, `REPLIT_DEPLOYMENT_GUIDE.md`, `REBUILD_GUIDE.md`, `UX_AUDIT_IMPLEMENTATION_REPORT.md`.
- Integration hints: `supabase-conversation-tables.sql`, Stripe test scripts, Replit config (`.replit`, `replit.md`), `components.json` (shadcn/ui), and `drizzle` ORM usage.

These indicate a Vite+React/Tailwind front‑end with a Node/Express (likely) back‑end, Supabase DB, Stripe payments, and Cloud‑Run/Replit deployment options.

---

## 1) Quick wins (do these first)
1. **Lock environment surfaces**
   - Require `.env` schema validation at boot (zod‑validated config) and fail fast if keys missing.
   - Turn on `helmet`, `cors` with explicit allowlist in `server` and disable `x-powered-by`.
2. **Ship a lean client bundle**
   - Enable `splitChunks`, dynamic imports for heavy routes, and vendor chunking. Ensure `build.target` is modern in Vite and set `build.cssCodeSplit=true`.
   - Audit `node_modules` size with `vite-bundle-visualizer`; replace oversized libs, tree‑shake icons (lucide imports).
3. **Page speed hygiene**
   - Add `preload`/`prefetch` for critical fonts; serve fonts locally with `font-display: swap`.
   - Add `<link rel="preconnect">` to Supabase and Stripe domains only where needed.
4. **A11y & UX**
   - Global skip‑link, landmark roles, keyboard traps check, focus rings retained, color contrast ≥ 4.5:1 (Tailwind tokens).
5. **SEO**
   - Per‑route `<title>`, meta description, Open Graph/Twitter tags; JSON‑LD for Organization, WebSite, and Product/Offer for paid assessments.
   - Generate `sitemap.xml` and `robots.txt`; add canonical tags.
6. **Observability**
   - Health endpoints (`/healthz`, `/readyz`) already hinted—pipe into uptime checks. Add structured logging (pino) and client perf beacons (web‑vitals) to Supabase/Logflare.

---

## 2) Front‑end (Vite/React/Tailwind)
### Build & assets
- **Vite config**
  - Ensure `define: { __BUILD_TIME__: JSON.stringify(new Date().toISOString()) }` for cache busting and diagnostics.
  - Use `esbuild.target: 'es2022'` and `build.target: 'es2022'` to reduce transpile weight.
  - Turn on `build.minify: 'esbuild'`, `build.sourcemap: false` for prod; generate separate legacy build only if analytics show Safari ≤ iOS 13 share.
- **Code splitting**
  - `React.lazy` + `Suspense` for infrequently used flows (payments, coach profiles, admin dashboards).
  - Route‑level chunk boundaries via your router.
- **CSS**
  - Purge is handled by Tailwind; ensure safelist covers dynamic class names.
  - Consider extracting design tokens to CSS variables for theme performance.

### Accessibility checklist
- Headings hierarchical (no H1 skips), labelled form controls, ARIA only when semantics fail.
- Visible focus, prefers‑reduced‑motion respected for animations.
- Error summaries on forms; inline validation with aria‑describedby.

### UX polish
- **Perceived speed**: skeletons for assessments dashboard, optimistic UI on saving progress.
- **Mobile**: clamp line‑length, larger tap targets, sticky “Start Assessment” CTA on long pages.
- **Empty states** with illustrative copy; coach “personas” cards with badges (EFT/Gottman/etc.) and trust markers.

---

## 3) Back‑end (Node/Express + Supabase + Stripe)
### Security hardening
- `helmet` with strict CSP: default‑src 'self'; connect‑src allow supabase/stripe; frame‑ancestors 'none' (unless embedding Stripe elements); upgrade‑insecure‑requests in prod.
- Rate‑limit (`express-rate-limit`) on auth, webhooks, AI endpoints; deny list for abusive IPs.
- Input validation everywhere (zod on routes). Reject unknown fields.
- Secrets only from environment; **no** defaults checked into repo. Rotate Stripe keys; use restricted keys for client.
- Supabase RLS enabled; policies tested per table. Separate service role key server‑only.
- Stripe webhooks:
  - Verify signatures, idempotency keys, and handle `checkout.session.completed` + `invoice.paid` only.
  - Store minimal PII, map to internal user IDs, not emails alone.

### Architecture
- Define a “Domain Services” layer: `assessment`, `billing`, `coaching`, `content` with DTOs.
- Add **feature flags** (DB table) to dark‑launch experiments (longer assessments, AI coach variants).
- Background jobs: use Supabase Edge Functions or a tiny worker (BullMQ/Cloud Run Jobs) for emails, report generation.

---

## 4) Data & Privacy
- Data minimization: store answers + derived scores; keep free‑text optional & redact on export.
- **Exports & deletion**: one‑click JSON export; GDPR‑style delete (cascade). Log retention policy (30–90 days).
- Pseudonymize analytics; avoid storing IPs long‑term; never log auth tokens.

---

## 5) Payments & Entitlements
- **Stripe Checkout** flow:
  - Use **Prices** for products (free Secure Attachment; paid extended results and niche assessments).
  - Post‑success: call an entitlements service to issue access tokens/DB flags. Keep front‑end “paid” UI in sync via TanStack Query keys.
- **Anti‑fraud**: webhook verification, receipts emailed, download limits for PDFs, and abuse throttles.

---

## 6) SEO & Content
- One H1 per page; keyword‑aligned H2s; avoid duplicate titles.
- Add `next-sitemap`‑style generator or a small script in Node to emit `sitemap.xml` from route map.
- JSON‑LD:
  - `Organization`, `Person` (coach profiles), `FAQPage` (assessment FAQs), `Product` + `Offer` for paid assessments, `HowTo` for “DIY retreat” steps.
- Add `hreflang` only if multilingual launched.

---

## 7) Performance targets (Core Web Vitals)
- **LCP < 2.5s**, **INP < 200ms**, **CLS < 0.1** on 4G/low‑end Android.
- Serve images in AVIF/WebP; responsive `srcset`; lazy‑load below‑the‑fold.
- Cache‑control: static assets `immutable, max-age=31536000`; HTML `no-store`. ETags off behind immutable hashes.
- Inline tiny critical CSS (~3–5KB) for landing.

---

## 8) Deployments (Replit / Cloud Run / Vercel)
- **Unified start scripts**: `npm run dev` (concurrently client+server), `npm run build`, `npm start` (serve built client + API). Ensure Replit `.replit` uses these.
- **Health checks**: `/healthz` returns `200` with build hash + DB ping status; `/readyz` checks Stripe/Supabase connectivity.
- **Environment**: Replit secrets for `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `WEBHOOK_SECRET`, `OPENAI_KEY` (server only).
- **Cloud Run**: container with `PORT` binding, `NODE_ENV=production`, `--allow-unauthenticated` only for HTTP; minimum instances 0–1; CPU throttling off during requests.

---

## 9) Monitoring & Analytics
- Server logs: pino JSON to stdout; capture in Cloud Run logs or Replit console; set log levels by env.
- Client RUM: `web-vitals` to Supabase table (page, vitals, userAgent, connection).
- Error tracking: Sentry (client+server) with release tags from CI.
- Uptime: health checks every minute; alerting via email + webhook to your ops channel.

---

## 10) Prioritized Action Plan (2 weeks)

### Day 1–2: Security & env
- Add `helmet`, strict CORS, remove `x-powered-by`, Zod config guard, rotate keys.

### Day 3–5: Performance & SEO
- Bundle audit, code‑split heavy routes, font optimization, JSON‑LD + meta pass, sitemap/robots.

### Day 6–8: Payments & data
- Harden Stripe webhooks, entitlement service, Supabase RLS verification, add data export/delete endpoints.

### Day 9–11: A11y & UX
- Pass axe‑core: headings, labels, focus, contrast; mobile polish; skeletons.

### Day 12–14: Observability & deploy
- Health/readiness, pino logging, web‑vitals, Sentry; verify Replit and Cloud Run builds from clean env.

---

## 11) Suggested CI checks
- Lint/Type check: `eslint`, `tsc --noEmit`.
- Unit tests: vitest for utils and scoring logic.
- E2E: Playwright for checkout and assessment completion.
- Security: `npm audit --production`, `npx @passlock/depcheck` (or similar), `gitleaks` pre‑commit.

---

## 12) Nice‑to‑have next
- Feature flags for experiments (longer assessments, AI coach variants).
- Internationalization scaffold (react‑i18next).
- Content moderation for free‑text inputs (OpenAI text moderation or a light heuristic).

---

## 13) Snippets to drop in

### 13.1 Express hardening
```js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https:", "'unsafe-inline'"],
      "connect-src": ["'self'", "https://*.supabase.co", "https://api.stripe.com"],
      "frame-ancestors": ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

const allowlist = [process.env.CLIENT_ORIGIN];
app.use(cors({
  origin: (origin, cb) => cb(null, !origin || allowlist.includes(origin)),
  credentials: true
}));
```

### 13.2 Zod env guard
```ts
import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development','test','production']),
  PORT: z.string().default('3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  OPENAI_API_KEY: z.string().optional() // server-only
});

export const env = Env.parse(process.env);
```

### 13.3 Web‑Vitals beacon
```ts
import { onLCP, onINP, onCLS } from 'web-vitals';

const send = (metric) => {
  navigator.sendBeacon('/api/rum', JSON.stringify({
    n: metric.name, v: metric.value, id: metric.id,
    p: location.pathname, ua: navigator.userAgent
  }));
};

onLCP(send); onINP(send); onCLS(send);
```

---

## 14) Evidence & references
- Repo structure and files (client/server/shared, Vite/Tailwind/TypeScript configs, Stripe/Supabase SQL) observed directly in the repository.
- Health‑check and deployment scripts suggest Cloud Run/Replit targets.

---

## 15) Final word
You’ve got the bones of a serious platform. Tighten security, trim the bundle, give search engines structured data to chew on, and wire good observability. After that, the fun part: experiments to find product‑market electricity.
