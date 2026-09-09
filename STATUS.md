# Project Status

_Last updated: 2026-09-09_

## Current state

- **Crossword gameplay is hidden.** `/play` shows a "coming soon" placeholder instead of the tier/puzzle picker, and `/play/[tier]` + `/play/[tier]/[puzzleId]` redirect back to it. Nothing was deleted — the crossword engine, generated puzzle data, and reward logic are all still in the codebase; the original screens are recoverable from git history (commit `10ba23e`, before they were replaced in `5240947`).
- **Auth is email + phone number**, not Google OAuth. The phone number is used as the Supabase Auth password under the hood but is labeled "Phone Number" in the UI — no password field is shown to players. See `src/components/auth/LoginForm.tsx` and `src/lib/auth/AuthContext.tsx`.
- Supabase project: `cyhrnhpculksmgdrmplk` — schema (`supabase/schema.sql`) has been applied, including the `profiles.phone` column.
- Repo: https://github.com/collinskulei/UnicornGermanGame

## Open action items

1. **Vercel deployment is failing.** Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as environment variables in the Vercel project (Settings → Environment Variables, for Production at minimum), then redeploy. Local build/dev already works fine with these set in `.env.local`.
2. **Crossword redesign is pending.** The current auto-generated grids (`scripts/generate-puzzles.mjs`) came out sparser/more irregular than a typical dense crossword — lots of blocked cells, wide bounding boxes for only 10 words. Needs a decision on direction before un-hiding `/play`:
   - Tighten the grid-generation heuristic (favor more intersections, smaller bounding box), or
   - Rework the puzzle format entirely, or
   - Other feedback on what specifically "didn't come as needed."

## Reference docs

- `README.md` — setup instructions (Supabase, env vars, running locally, regenerating puzzles)
- `DESIGN_SYSTEM.md` — brand colors, typography, gamification UI patterns
