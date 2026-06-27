# PrintsLB — Deployment, Scalability & Security

This document covers deploying to Cloudflare, wiring the `printslb.com` domain,
and the security / DDoS / scalability setup.

> Current status: **Cloudflare database/storage are provisioned, Worker is not
> deployed yet.** D1 database `printslb-db`
> (`24b185bd-506b-4448-90f0-5f14edc2438c`) has the migrated Neon data. R2
> buckets `printslb-images` and `printslb-uploads` are created. Follow the
> deploy steps below when you're ready to publish the Worker.

---

## 1. Prerequisites

```bash
npm install -g wrangler   # or use npx wrangler
wrangler login            # authenticate the CLI with your Cloudflare account
```

You also need these GitHub repo secrets for the deploy workflow:

- `CLOUDFLARE_API_TOKEN` — token with **Workers Scripts: Edit**, **D1: Edit**,
  **Workers R2 Storage: Edit**, **Account Settings: Read**.
- `CLOUDFLARE_ACCOUNT_ID` — found on the Cloudflare dashboard home.

These runtime app secrets must be set in Cloudflare Workers with
`wrangler secret put ...` before production login works:

- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `TURNSTILE_SECRET_KEY` if Turnstile is enabled
- Any optional notification/cache secrets you use, such as Telegram or Redis

---

## 2. Provision Cloudflare resources

```bash
# D1 database
wrangler d1 create printslb-db
# -> copy the returned database_id into wrangler.jsonc (replace the placeholder)

# R2 buckets
wrangler r2 bucket create printslb-images
wrangler r2 bucket create printslb-uploads

# Apply the schema to D1 (uses prisma migrations/SQL)
npx prisma generate
wrangler d1 execute printslb-db --remote --file=./prisma/d1-schema.sql

# If the D1 database already existed before Google OAuth was added, run once:
wrangler d1 execute printslb-db --remote --file=./prisma/d1-google-oauth.sql

# Optional: migrate existing Neon/Postgres data into D1
node scripts/export-neon-to-d1.mjs
wrangler d1 execute printslb-db --remote --file=./prisma/d1-data.sql
```

Set production secrets (never commit these):

```bash
wrangler secret put NEXTAUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
wrangler secret put ADMIN_EMAIL
wrangler secret put ADMIN_PASSWORD
wrangler secret put REDIS_REST_URL
wrangler secret put REDIS_REST_TOKEN
wrangler secret put TURNSTILE_SECRET_KEY
```

---

## 3. Google Login

Create the client in Google Cloud Console:

1. Go to **APIs & Services -> OAuth consent screen** and configure the app.
2. Go to **APIs & Services -> Credentials -> Create Credentials -> OAuth client ID**.
3. Choose **Application type: Web application**.
4. Add these **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://printslb.com`
5. Add these **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://printslb.com/api/auth/callback/google`
6. Copy the generated values into local `.env`:
   - `GOOGLE_CLIENT_ID="...apps.googleusercontent.com"`
   - `GOOGLE_CLIENT_SECRET="..."`
7. Put the same production values into Cloudflare Worker secrets:

```bash
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

For local development, keep `NEXTAUTH_URL="http://localhost:3000"`. For
production, `wrangler.jsonc` already sets `NEXTAUTH_URL` to
`https://printslb.com`.

---

## 4. Deploy

```bash
npm run deploy   # opennextjs-cloudflare build && deploy
```

CI/CD also runs this automatically — see **section 7**.

---

## 5. Domain: printslb.com

1. In the Cloudflare dashboard, add the site **printslb.com** (Websites → Add a site).
2. Update your registrar's nameservers to the two Cloudflare nameservers shown.
3. Once active, go to the Worker (**Workers & Pages → printslb → Settings → Domains & Routes**).
4. Add **Custom Domain** `printslb.com` and `www.printslb.com`.
5. Confirm `NEXTAUTH_URL=https://printslb.com` (already set in `wrangler.jsonc`).
6. In Google Cloud Console → Credentials, add the authorized redirect URI:
   `https://printslb.com/api/auth/callback/google`.

---

## 6. Scalability & DDoS protection (layered)

**Layer 1 — Cloudflare edge (primary, fully scalable).** Handles volumetric
attacks before they reach the Worker.

- **Managed DDoS:** on by default for all proxied (orange-cloud) traffic.
- **WAF Rate Limiting Rules** (Security → WAF → Rate limiting rules). Suggested:
  - `/api/auth/*` and `/api/admin/*`: **10 req / 1 min per IP** → Block 10 min.
  - `/api/*`: **60 req / 1 min per IP** → Managed Challenge.
  - All other paths: **200 req / 1 min per IP** → Managed Challenge.
- **Bot Fight Mode** (Security → Bots): on, to filter automated abuse.
- **Security Level:** Medium/High; enable **Under Attack Mode** during incidents.
- **Custom WAF rules / IP Access Rules:** block/allow specific IPs, ASNs or
  countries here for instant, edge-level IP bans.

**Layer 2 — App middleware (`src/middleware.ts`).** A second line of defense
inside the Worker:
- Per-IP fixed-window rate limits per route group (auth / api / page).
- Automatic temporary bans after repeated limit breaches.
- Static ban list via the `BANNED_IPS` env var.
- Sends security headers and `Retry-After` / `X-RateLimit-*` headers.

> The middleware store is per-isolate (best-effort). For strict global counters
> across the fleet, back it with a **Durable Object** or **KV** — Cloudflare's
> WAF is the authoritative limiter for serious traffic.

**Scalability.** Cloudflare Workers scale horizontally and automatically across
the global network; there are no servers to size. D1 + R2 are managed and
autoscale. Keep responses cacheable where possible and rely on the edge cache.

---

## 7. CI/CD

- **`.github/workflows/ci.yml`** runs on every push/PR:
  - `lint`, `typecheck`, `build`
  - `npm audit` (fails on high/critical)
  - **Gitleaks** secret scanning
  - **CodeQL** static analysis (results in the repo Security tab)
- **`.github/workflows/deploy.yml`** deploys to Cloudflare after CI passes on
  `main`, or via manual **workflow_dispatch**. It requires these GitHub
  repository or `production` environment secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

The deploy workflow does not store app runtime secrets. Keep app runtime secrets
in Cloudflare Workers via `wrangler secret put`, then CD can deploy new Worker
versions without exposing those values to GitHub Actions logs.
