# Project Status

_Last updated: 2026-09-10_

## Current state

- **The core game is now Swipe-to-Match** (Tier 1, item 1 in `GAME_MECHANICS_IDEAS.md`), replacing the crossword. `/play` → tier picker → `/play/[tier]` → deck picker → `/play/[tier]/[puzzleId]` → the swipe game itself. Same brand colors used for the two swipe directions: dragging/tapping right = "MATCH" (orange), left = "NO MATCH" (blue).
  - Engine: `src/lib/game/useSwipeMatch.ts` — builds a 10-card deck per level's existing vocab deck (reuses `src/data/puzzles.ts`, ignoring its now-unused grid/layout fields), pairing each German word with either its real clue (a "match") or another word's clue (a "no match") roughly 50/50.
  - UI: `src/components/swipe/SwipeCard.tsx` (draggable Framer Motion card, plus ✕/✓ buttons for non-drag input) and `SwipeDeck.tsx` (progress bar + card stack).
  - Levels still map 1:1 to CEFR tiers/vocab exactly as before (Foal A1 → Alicorn C1) — no change to `tiers.ts`, `rewards.ts`, `achievements.ts`, the leaderboard views, or `submitAttempt.ts`; the whole reward/XP/streak/achievement/leaderboard system carried over unchanged since it was built generically around "tier + puzzleId + time + accuracy," not around the crossword specifically.
  - The old crossword engine/components (`useCrossword.ts`, `CrosswordBoard.tsx`, `ClueList.tsx`) were deleted (superseded, not just hidden) — still recoverable from git history (commit `10ba23e`) if ever needed.
  - Caught and fixed one real bug during testing: the deck's shuffle used `Math.random()` inside what was originally a lazy `useState` initializer, which runs during SSR too — server and client each rolled a different shuffle, causing a hydration mismatch. Fixed by building the deck in a client-only effect instead (see comment in `useSwipeMatch.ts`).
- **Auth is email + phone number**, not Google OAuth. The phone number is used as the Supabase Auth password under the hood but is labeled "Phone Number" in the UI — no password field is shown to players. See `src/components/auth/LoginForm.tsx` and `src/lib/auth/AuthContext.tsx`.
- Supabase project: `cyhrnhpculksmgdrmplk` — schema (`supabase/schema.sql`) has been applied, including the `profiles.phone` column.
- Repo: https://github.com/collinskulei/UnicornGermanGame

## Open action items

1. **Vercel deployment is failing.** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel project (Settings → Environment Variables, for Production at minimum), then redeploy. Local build/dev already works fine with these set in `.env.local`.
2. **Tier 2+ mechanics from `GAME_MECHANICS_IDEAS.md` are not built yet** (skill tree map, memory garden, daily quest board, leagues, etc.) — swipe-to-match is just the core loop (Tier 1). Revisit that doc when ready to layer on progression/retention/social systems.

## Reference docs

- `README.md` — setup instructions (Supabase, env vars, running locally, regenerating puzzles)
- `DESIGN_SYSTEM.md` — brand colors, typography, gamification UI patterns
