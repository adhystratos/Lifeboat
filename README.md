# Lifeboat

Agenda + asset and finance tracker. One TypeScript codebase for web, iOS and Android, built with Expo Router and Supabase.

> Working name. The product plan lives in the project files (`plan/product-and-tech-plan.md`).

## Stack

- **Expo SDK 58 + Expo Router**: one app, rendered on web through React Native Web, built for mobile with EAS.
- **Supabase**: Postgres, email sign-in, and row-level security.
- **TanStack Query** for server data.
- **Vitest** for the framework-free domain logic in `src/core`.

## Layout

```
src/app/            Screens (Expo Router). (tabs)/ holds Today, Calendar, Money, Assets (/wealth),
                    Settings; new*.tsx are the entry forms
src/core/           Pure TypeScript: currencies, FX, net worth, recurrence, calendar days, bills (unit-tested)
src/lib/            Data layer: repo.ts (interface), repo-supabase.ts, repo-demo.ts (sample data), hooks
src/components/     Shared UI
supabase/migrations SQL schema, RLS policies, new-user bootstrap
```

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
npm run web                  # or: npm run ios / npm run android (Expo Go)
```

Without a `.env.local`, the app still starts, explains that Supabase isn't configured, and offers **Explore with sample data**: an in-memory sample workspace (invented tasks, events, bills, accounts and assets) for trying every screen. Nothing is saved, and sample mode is also available in development builds.

### Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the schema: every file in `supabase/migrations/`, in name order (`20261016000000_init.sql`, then `20261017000000_agenda_and_bills.sql`). Either paste each into **SQL Editor** and run it, or use the CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
3. **Authentication → Email Templates → Magic Link**: include the one-time code so it can be typed into the app on any device, for example `Your Lifeboat code is {{ .Token }}`.
4. Copy the project URL and anon key from **Project Settings → API** into `.env.local`.

5. Exchange rates (for totals across IDR, EUR, USD and PLN): deploy the rates function with `npx supabase functions deploy fx-rates`, then schedule it daily in **Integrations → Cron** (an HTTP request to the function URL, e.g. every day at 17:00 UTC, after the ECB publishes). Until rates exist, the app shows each foreign-currency amount as not yet included rather than guessing. You can also add a rate by hand in the `fx_rates` table.

Each new user automatically gets a profile, a personal workspace (main currency IDR), starter categories and a Cash account.

## Data model notes

- Money is stored as integer minor units (`amount_minor`) plus a currency: `IDR`, `EUR`, `USD` or `PLN`. Rupiah is displayed without decimals.
- Every row belongs to a workspace, and RLS grants access through workspace membership. v1 has one personal workspace per user, so shared access later only needs an invite flow.
- Recurrence uses a subset of RRULE (`FREQ`, `INTERVAL`, `COUNT`, `UNTIL`) on calendar dates, so bills never shift days across time zones.

## Scripts

| Command | What it does |
|---|---|
| `npm run web` | Dev server in the browser |
| `npm test` | Unit tests for `src/core` |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint (Expo config) |
| `npm run build:web` | Static web build in `dist/` |

## Deploying the web app

`npm run build:web` produces a static single-page app in `dist/`. Host it anywhere static (Vercel, Netlify, Cloudflare Pages, or an Apache/cPanel host). The included `.htaccess` routes deep links back to `index.html` on Apache. Set the `EXPO_PUBLIC_*` variables in the build environment.

## Mobile builds

Use EAS (`npx eas-cli@latest build`). No local Xcode or Android Studio is required.
