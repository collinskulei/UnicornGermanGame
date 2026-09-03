# 🦄 Unicorn Language Center — German Crossword Quest

A gamified crossword app for young adults in Kenya learning German. English clues, German answers, 5 CEFR-aligned difficulty levels (Foal → Alicorn), simple email + phone number sign-in (no password to remember), XP/coins/streaks/achievements, and per-level leaderboards ranked by speed and accuracy.

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the full visual/gamification design language.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Auth (email + phone, no OAuth needed), Postgres (profiles, scores, achievements), leaderboard views
- **Framer Motion** + **canvas-confetti** for reward "juice"
- **Zustand** for lightweight client UI state (toasts, celebration modals)

## One-time setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. Open the SQL Editor and run the contents of [`supabase/schema.sql`](./supabase/schema.sql) once. This creates the `profiles`, `puzzle_attempts`, and `user_achievements` tables, row-level security policies, the new-user trigger, and the leaderboard views.

### 3. Turn off email confirmation (recommended)

Sign-in uses Supabase's built-in email/password auth, except there's no password field shown — the player's **phone number is used as the password** under the hood, so returning players never have to remember a separate secret.

By default, new Supabase projects require players to click a confirmation link in their email before they can log in, which adds friction back in. To keep sign-up truly one-step:

1. In your Supabase dashboard: **Authentication → Sign In / Providers → Email**.
2. Turn **Confirm email** off.

(If you'd rather keep email confirmation on, that's fine too — the app already handles it: after signing up, players see a "check your email" message and can log in normally once they've clicked the link.)

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 2.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` and play — enter any email and phone number to create an account, or the same pair again to log back in.

## Puzzle content

Crossword grids are **generated, not hand-authored**, so every intersection is guaranteed structurally valid.

- [`content/vocab-source.json`](./content/vocab-source.json) — flat lists of `{answer, clue}` pairs per puzzle (no layout info). This is the file to edit if you want to change/add vocabulary.
- [`scripts/generate-puzzles.mjs`](./scripts/generate-puzzles.mjs) — a criss-cross grid-placement algorithm that lays each puzzle's words onto a grid, guarantees every overlap is a genuine shared letter, and prevents words from accidentally running together.
- Running it writes `content/puzzles.json` (human-readable) and `src/data/puzzles.ts` (the typed data the app actually imports).

After editing vocabulary content, regenerate:

```bash
npm run generate:puzzles
```

There are 5 tiers (`foal`, `colt`, `stallion`, `pegasus`, `alicorn`) × 5 puzzles each × 10 words — 250 words total.

## How progression works

- Every completed puzzle awards **XP**, **Sparkle Dust (coins)**, and a **score** (`src/lib/rewards.ts`) based on accuracy, time, and hints used.
- XP accumulates toward 5 tiers (`src/lib/tiers.ts`) — reaching a tier's XP threshold both evolves the player's unicorn avatar **and** unlocks that tier's puzzles. Tier names double as CEFR levels: Foal (A1) → Colt (A2) → Stallion (B1) → Pegasus (B2) → Alicorn (C1).
- Daily streaks, a rotating **Daily Challenge**, and 18 achievements (`src/lib/achievements.ts`) are evaluated automatically on puzzle completion in `src/lib/game/submitAttempt.ts`.
- Leaderboards (`tier_leaderboard` SQL view) rank players per tier by total score across their best attempt at each puzzle in that tier — rewarding both full completion and doing each puzzle well — tie-broken by total time.

## Project structure

```
content/               vocabulary source + generated puzzle JSON
scripts/                grid-generation script
supabase/schema.sql      DB schema, RLS policies, leaderboard views
src/
  app/                   routes (landing page is public; /play, /leaderboard, /profile require auth)
  components/
    crossword/           the grid + clue list UI
    providers/            auth context wiring + celebration/toast overlay
    ui/                   shared atoms (navbar, XP bar, avatar badge)
  data/puzzles.ts         generated puzzle data (do not hand-edit)
  lib/
    game/                 crossword engine hook, reward submission, daily challenge
    supabase/              browser/server/middleware Supabase clients
    tiers.ts, rewards.ts, achievements.ts   the reward-economy rules
  types/                  shared TypeScript types
```

## Deploying

Any Next.js host works (Vercel is the path of least resistance). Set the same environment variables from `.env.local` in your host's project settings.
