# WholeWellness Coaching — Debug & Hardening Kit (Replit-Ready)

This single document packages the crash fix, Service Worker (SW) rules, CSP policy, and admin-route hygiene into copy-pasteable files and steps tailored for **Replit**. Follow top-to-bottom; you can commit after each section.

---

## 0) Replit basics

### `.replit`
```ini
run = "npm run dev"
```

### `replit.nix` (if your Repl uses Nix)
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
  ];
}
```

### `package.json` (root, scripts & engine)
> Keep your existing dependencies; just ensure these scripts/fields exist.
```json
{
  "type": "module",
  "engines": { "node": ">=20 <21" },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "eslint ."
  }
}
```

---

## 1) Source maps and debug flag (Vite)

### `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { sourcemap: true },        // readable stack traces in Replit console
  define: { __DEV__: 'true' }        // optional feature flag
})
```

---

## 2) Guard against the `.join` crash

Symptom: `TypeError: Cannot read properties of undefined (reading 'join')` on the assessments page.

### 2a) Safe join helper

**Create:** `client/src/lib/safeJoin.ts`
```ts
export const safeJoin = (input: unknown, sep = ', '): string =>
  Array.isArray(input) ? input.join(sep) : '';
```

### 2b) Validate API shape with Zod

**Create:** `client/src/hooks/useAssessments.ts`
```ts
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const Assessment = z.object({
  id: z.string(),
  name: z.string(),
  tags: z.array(z.string()).default([])
})
const AssessmentsResponse = z.array(Assessment).default([])

async function fetchAssessmentTypes() {
  const res = await fetch('/api/assessments/assessment-types', { credentials: 'include' })
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
  const json = await res.json()
  return AssessmentsResponse.parse(json)
}

export function useAssessmentTypes() {
  return useQuery({
    queryKey: ['assessmentTypes'],
    queryFn: fetchAssessmentTypes,
    staleTime: 60_000
  })
}
```

> Install Zod if needed:
```bash
npm i zod
```

### 2c) Defensive render

**Edit:** `client/src/routes/Assessments.tsx` (or your assessments page component)
```tsx
import { safeJoin } from '@/lib/safeJoin'
import { useAssessmentTypes } from '@/hooks/useAssessments'

export default function Assessments() {
  const { data = [], isLoading, error } = useAssessmentTypes()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p role="alert">Failed to load assessments.</p>

  return (
    <ul>
      {data.map(a => (
        <li key={a.id}>
          <strong>{a.name}</strong>
          <div className="text-muted">{safeJoin(a.tags)}</div>
        </li>
      ))}
    </ul>
  )
}
```

---

## 3) Error boundary + React Query Devtools (easier debugging)

### `client/src/components/ErrorBoundary.tsx`
```tsx
import { Component, ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error, info: unknown) { console.error('[ErrorBoundary]', error, info) }
  render() {
    if (this.state.hasError) {
      return <div role="alert">Something broke. Check console for details.</div>
    }
    return this.props.children
  }
}
```

**Wrap app root (e.g., `main.tsx` or `App.tsx`):**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

root.render(
  <ErrorBoundary>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </ErrorBoundary>
)
```

> Install devtools if missing:
```bash
npm i -D @tanstack/react-query-devtools
```

---

## 4) Service Worker: stop caching auth/user endpoints

Your SW was caching user-bound endpoints, causing stale auth and shape mismatches.

**Create/Edit:** `public/sw.js`
```js
const VERSION = 'v5';

self.addEventListener('install', e => { self.skipWaiting() })
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

const isAuthUser = (url) =>
  url.pathname.startsWith('/api/auth') ||
  url.pathname.startsWith('/api/admin') ||
  url.pathname.startsWith('/api/assessments/user')

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  // Never cache sensitive/user-bound endpoints
  if (isAuthUser(url)) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }))
    return
  }

  // Cache-first for static, same-origin assets
  const isStatic = url.origin === location.origin &&
    (url.pathname.startsWith('/assets') ||
     url.pathname.endsWith('.webmanifest') ||
     url.pathname.endsWith('/favicon.ico'))

  if (isStatic) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  // Default: network-first for everything else
  event.respondWith(networkFirst(event.request))
})

async function cacheFirst(req) {
  const cache = await caches.open(VERSION)
  const hit = await cache.match(req)
  if (hit) return hit
  const res = await fetch(req)
  if (res.ok) cache.put(req, res.clone())
  return res
}

async function networkFirst(req) {
  const cache = await caches.open(VERSION)
  try {
    const res = await fetch(req)
    if (res.ok) cache.put(req, res.clone())
    return res
  } catch {
    const hit = await cache.match(req)
    return hit || new Response('Offline', { status: 503 })
  }
}
```

**Re-register on the client** (where you register SW):
```ts
navigator.serviceWorker.register('/sw.js').then(reg => {
  if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' })
})
```

**Debug tip in Replit:** Open DevTools → Application → Service Workers → check **“Bypass for network”** during debugging to eliminate SW interference.

---

## 5) Content-Security-Policy (CSP) to allow Google Fonts via SW

If you serve through Express, use **Helmet**.

### `server/src/middleware/csp.ts`
```ts
import helmet from 'helmet'

export const csp = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "connect-src": ["'self'", "https://api.stripe.com", "*.google.com", "*.googleapis.com", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "https://*"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "script-src": ["'self'", "https://js.stripe.com"],
      "frame-src": ["'self'", "https://js.stripe.com"]
    }
  }
})
```

**Mount it in your server entry (if applicable):**
```ts
import express from 'express'
import { csp } from './middleware/csp'
const app = express()
app.use(csp)
```

> If you set CSP via `<meta http-equiv="Content-Security-Policy">` in `index.html`, mirror the same directives there.

---

## 6) Don’t call admin endpoints unless user is admin

### `client/src/hooks/useAdminMe.ts`
```ts
import { useQuery } from '@tanstack/react-query'

export function useAdminMe(isAdmin: boolean) {
  return useQuery({
    queryKey: ['adminMe'],
    queryFn: async () => {
      const res = await fetch('/api/admin/auth/me', { credentials: 'include' })
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
      return res.json()
    },
    enabled: !!isAdmin,
    retry: false
  })
}
```

Use it like:
```ts
const isAdmin = user?.roles?.includes('admin') ?? false
const { data: adminProfile } = useAdminMe(isAdmin)
```

---

## 7) Environment hygiene

### `.env.example`
```env
# Public (Vite)
VITE_API_BASE=/api

# Server
SESSION_SECRET=change_me
STRIPE_PUBLISHABLE_KEY=pk_live_or_test
STRIPE_SECRET_KEY=sk_live_or_test
```

> Never commit real `.env` values. In Replit, add Secrets via the **🔒 Secrets** tab.

---

## 8) Optional: Playwright smoke test (to catch the crash forever)

### `tests/assessments.spec.ts`
```ts
import { test, expect } from '@playwright/test'

test('assessments page renders safely', async ({ page }) => {
  await page.goto('http://localhost:5173/assessments', { waitUntil: 'domcontentloaded' })
  const consoleErrors: string[] = []
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  await expect(page.locator('ul')).toBeVisible()
  expect(consoleErrors.join('
')).not.toMatch(/Cannot read properties of undefined \(reading 'join'\)/)
})
```

**GitHub Action (optional):** `.github/workflows/ci.yml`
```yaml
name: CI
on:
  push: { branches: [ main ] }
  pull_request:
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
```

---

## 9) Verification checklist (Replit)

1. **Open shell** → `npm run dev` → open the webview.  
2. DevTools → Application → Service Workers → enable **Bypass for network**; hard refresh.  
3. Visit `/assessments` → no `.join` error; items render; empty tags safely show as blank.  
4. Log out → confirm no `/api/admin/auth/me` calls.  
5. Disable “Bypass for network” → reload; ensure `/api/auth/*` and `/api/assessments/user` are **not** served from cache (Network tab).  
6. Confirm CSP no longer blocks `fonts.gstatic.com` or `fonts.googleapis.com`.  
7. Check console stack traces map to TS source (sourcemaps are on).

---

## 10) Quick repo hygiene (recommended)

### `.gitignore` (root)
```gitignore
# Node
node_modules/
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
.yarn/*
.yarnrc.yml

# Build output
dist/
build/
.next/
out/

# OS/editor
.DS_Store
Thumbs.db
.vscode/
.idea/

# Server state / temp
server.pid
tmp/
*.log

# Local env
.env
.env.*
!.env.example

# Archives
*.zip

# Replit
.replit
replit.nix
```

Then run:
```bash
git rm -r --cached dist tmp server.pid "*.zip"
git add .gitignore
git commit -m "chore: replit-ready debug kit + hygiene"
```

---

### Done

This kit removes the crash, tames the Service Worker, fixes CSP, and makes Replit debugging pleasant. Next step: commit these changes, redeploy, and then we can profile route code-splitting and image policy for additional performance gains.
