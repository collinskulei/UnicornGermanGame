# Project Status

_Last updated: 2026-09-11_

## Current state

- **The core game is Swipe-to-Match** (Tier 1, item 1 in `GAME_MECHANICS_IDEAS.md`), replacing the crossword. `/play` → tier picker → `/play/[tier]` → deck picker → `/play/[tier]/[puzzleId]` → the swipe game itself. Right/orange = "MATCH", left/red = "NO MATCH".
  - Engine: `src/lib/game/useSwipeMatch.ts` — builds a 10-card deck per level's existing vocab deck (reuses `src/data/puzzles.ts`, ignoring its now-unused grid/layout fields), pairing each German word with either its real clue (a "match") or another word's clue (a "no match") roughly 50/50.
  - UI: `src/components/swipe/SwipeCard.tsx` (draggable Framer Motion card, plus ✕/✓ buttons for non-drag input) and `SwipeDeck.tsx` (progress bar + card stack).
  - Levels still map 1:1 to CEFR tiers/vocab exactly as before (Foal A1 → Alicorn C1) — no change to `tiers.ts`, `rewards.ts`, `achievements.ts`, the leaderboard views, or `submitAttempt.ts`.
  - The old crossword engine/components were deleted (superseded, not just hidden) — recoverable from git history (commit `10ba23e`) if ever needed.
- **Auth is magic link**, email-only, no password and no phone number. One button ("Send Magic Link") both creates a new account and logs in an existing one — Supabase's `signInWithOtp` handles both. See `src/components/auth/LoginForm.tsx` and `sendMagicLink` in `src/lib/auth/AuthContext.tsx`. This replaced the earlier email+phone-as-password scheme; `/auth/callback` and `/auth/auth-error` are back (needed again for the magic-link redirect) after being removed when Google OAuth was dropped.
  - The `profiles.phone` column from the old scheme still exists in the DB but is no longer populated or used anywhere — harmless, left as-is.
- **Players can rename themselves** from the Profile page — pencil icon next to the username opens an inline editor (`src/components/profile/UsernameEditor.tsx`), calling `updateUsername` in `AuthContext`. No uniqueness constraint (cosmetic display name only).
- **"Guide me" walkthrough** in the navbar — a 6-step tour narrated by the Unicorn mascot (`src/components/guide/`).
- **Landing page is minimal** — just the mascot, headline, and the sign-in form.
- Supabase project: `cyhrnhpculksmgdrmplk` — schema (`supabase/schema.sql`) has been applied.
- Repo: https://github.com/collinskulei/UnicornGermanGame

## Open action items

1. **Confirm Vercel deployment succeeds** after adding `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` to its project settings — last reported status was still failing before those were added; not yet re-confirmed.
2. **Add the production domain to Supabase's Redirect URLs** (Authentication → URL Configuration) once deployed, or magic links sent from production won't be able to redirect back — see README step 3.
3. **Tier 2+ mechanics from `GAME_MECHANICS_IDEAS.md` are not built yet** (skill tree map, memory garden, daily quest board, leagues, etc.) — swipe-to-match is just the core loop (Tier 1). Revisit that doc when ready to layer on progression/retention/social systems.

## Reference docs

- `README.md` — setup instructions (Supabase, env vars, running locally, regenerating puzzles)
- `DESIGN_SYSTEM.md` — brand colors, typography, gamification UI patterns
