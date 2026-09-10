# 🦄 Unicorn Language Center — German Crossword Quest

A gamified vocabulary app for young adults in Kenya learning German. English clues, German answers, 5 CEFR-aligned difficulty levels (Foal → Alicorn), a Tinder-style swipe-to-match core game, magic-link sign-in (no password, ever), XP/coins/streaks/achievements, and per-level leaderboards ranked by speed and accuracy.

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the full visual/gamification design language and [`STATUS.md`](./STATUS.md) for current project state and open items.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Auth (email magic link, no OAuth/passwords needed), Postgres (profiles, scores, achievements), leaderboard views
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

### 3. Allow the local/deployed URL as a redirect target

Magic links redirect back to `/auth/callback` on whatever URL sent them. In your Supabase dashboard: **Authentication → URL Configuration**, add `http://localhost:3000` (for local dev) and your production domain to the **Redirect URLs** allow-list, and set one of them as the **Site URL**.

Nothing else needs configuring — magic link is part of the same built-in Email provider as the password auth this app used to use, so it works out of the box.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from step 2.

### 5. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`, enter your email, and click the magic link Supabase emails you — that's it, no password, no separate signup step (a brand-new email creates the account automatically).

## Vocabulary content

- [`content/vocab-source.json`](./content/vocab-source.json) — flat lists of `{answer, clue}` pairs per deck (10 words per deck, 5 decks per tier). This is the file to edit if you want to change/add vocabulary.
- [`scripts/generate-puzzles.mjs`](./scripts/generate-puzzles.mjs) — originally a crossword grid-layout generator; the swipe-to-match game only reads the flat `words` list off its output (`content/puzzles.json` / `src/data/puzzles.ts`) and ignores the grid-specific fields, so this still needs to run once after editing `vocab-source.json`, but its grid-placement logic itself is otherwise unused dead weight now.

After editing vocabulary content, regenerate:

```bash
npm run generate:puzzles
```

There are 5 tiers (`foal`, `colt`, `stallion`, `pegasus`, `alicorn`) × 5 decks each × 10 words — 250 words total.

## How progression works

- Every completed deck awards **XP**, **Sparkle Dust (coins)**, and a **score** (`src/lib/rewards.ts`) based on accuracy and time.
- XP accumulates toward 5 tiers (`src/lib/tiers.ts`) — reaching a tier's XP threshold both evolves the player's unicorn avatar **and** unlocks that tier's decks. Tier names double as CEFR levels: Foal (A1) → Colt (A2) → Stallion (B1) → Pegasus (B2) → Alicorn (C1).
- Daily streaks, a rotating **Daily Challenge**, and 18 achievements (`src/lib/achievements.ts`) are evaluated automatically on completion in `src/lib/game/submitAttempt.ts`.
- Leaderboards (`tier_leaderboard` SQL view) rank players per tier by total score across their best attempt at each deck in that tier — rewarding both full completion and doing each deck well — tie-broken by total time.
- Players can rename themselves any time from the Profile page (pencil icon next to their name).

## Project structure

```
content/               vocabulary source + generated deck JSON
scripts/                grid-generation script (legacy; only its flat word list is used now)
supabase/schema.sql      DB schema, RLS policies, leaderboard views
src/
  app/                   routes (landing page is public; /play, /leaderboard, /profile require auth)
  components/
    auth/                magic-link sign-in form
    guide/               the "Guide me" unicorn walkthrough
    profile/             username editor
    swipe/               the swipe-to-match card + deck UI
    providers/            auth context wiring + celebration/toast overlay
    ui/                   shared atoms (navbar, XP bar, avatar badge)
  data/puzzles.ts         generated deck data (do not hand-edit)
  lib/
    game/                 swipe-match engine hook, reward submission, daily challenge
    supabase/              browser/server/middleware Supabase clients
    tiers.ts, rewards.ts, achievements.ts   the reward-economy rules
  types/                  shared TypeScript types
```

## Deploying

Any Next.js host works (Vercel is the path of least resistance). Set the same environment variables from `.env.local` in your host's project settings, and add its domain to Supabase's **Redirect URLs** (step 3 above) or magic links won't be able to redirect back.
