# 🦄 Unicorn Language Center — Design System
### *"Learn German. Chase the Sparkle."*

This is the single source of truth for how the Unicorn Gamified German crossword app looks, feels, animates, and talks. It's written to be friendly enough that anyone on the team — designer, developer, or content writer — can pick it up and build something that feels like it belongs in the same universe.

The whole system exists to serve one goal: make a **crossword puzzle for learning German feel as compulsively replayable as a mobile game**, while staying warm, encouraging, and never punishing. Bright, not childish. Playful, not chaotic. Rewarding, not manipulative-feeling.

---

## 1. Brand Foundation

**Mascot:** the Unicorn Language Center unicorn — a confident, warm-orange unicorn head in profile, flowing mane, inside (or breaking out of) a circular ring. The ring implies *progress* and *completion* — perfect for level rings, avatar frames, and progress indicators throughout the app.

**Personality:** encouraging older sibling, not a drill sergeant. Celebrates effort, never shames mistakes. Confident, energetic, a little cheeky — like a good gym coach who's also fun at parties.

**Core promise to the player:** *"Every session makes visible progress — a bigger unicorn, a fuller bar, a new badge, a better rank."*

---

## 2. Color System

Colors are pulled directly from the logo and extended into a full gamified palette. Always keep **Unicorn Orange** and **Unicorn Blue** as the dominant brand pairing — everything else is seasoning.

### 2.1 Brand core

| Token | Hex | Use |
|---|---|---|
| `--color-unicorn-orange` | `#F7931E` | Primary brand color. Mascot, primary buttons, energy/XP accents |
| `--color-unicorn-orange-dark` | `#D9740A` | Hover/pressed states, outlines |
| `--color-unicorn-orange-light` | `#FFB65C` | Highlights, glows, gradients |
| `--color-unicorn-blue` | `#1B2A6B` | Wordmark blue. Headlines, nav, primary text on light backgrounds |
| `--color-unicorn-blue-deep` | `#101B4D` | Darkest blue, dark-mode surfaces, footer |
| `--color-unicorn-blue-light` | `#3B4FA6` | Secondary buttons, links, info states |

### 2.2 Gamification accents

| Token | Hex | Use |
|---|---|---|
| `--color-xp` | `#FFC93C` | XP bars, level-up bursts, star ratings |
| `--color-coin` | `#FFD447` with `#B8860B` outline | Sparkle Dust currency icon |
| `--color-streak` | `#FF6B4A` | Streak flame, "at risk" warnings |
| `--color-success` | `#3DDC84` | Correct letters, success toasts, "completed" checkmarks |
| `--color-error` | `#FF5C6C` | Wrong-letter shake state (never harsh red — always soft coral) |
| `--color-diamond` | `#7DD3F7` | Rare/perfect-run rewards, C1 "Alicorn" tier accents |

### 2.3 Neutrals & surfaces

| Token | Hex | Use |
|---|---|---|
| `--color-cream` | `#FFF8EE` | App background (light) — warm, not clinical white |
| `--color-cloud` | `#FFFFFF` | Card surfaces |
| `--color-ink` | `#241B33` | Body text |
| `--color-ink-soft` | `#6B6478` | Secondary/muted text |
| `--color-line` | `#EFE3D0` | Borders, dividers |

### 2.4 Difficulty tier colors (also = avatar evolution stages)

Each of the 5 difficulty levels has its own color identity, used on badges, level cards, and progress rings. They read as a warm-to-cool "evolution" gradient, ending in the shimmering Alicorn tier.

| Level | CEFR | Color | Hex |
|---|---|---|---|
| 1. Foal | A1 | Soft peach | `#FFC9A0` |
| 2. Colt | A2 | Warm orange (brand) | `#F7931E` |
| 3. Stallion | B1 | Coral red | `#F2545B` |
| 4. Pegasus | B2 | Sky violet | `#7C6CF0` |
| 5. Alicorn | C1 | Iridescent teal→pink gradient | `#3DDCC7 → #F783D6` |

**Accessibility rule:** every color pairing used for text must meet WCAG AA (4.5:1) against its background. Orange-on-white fails this for body text — use `--color-unicorn-blue` or `--color-ink` for text, and reserve orange for large text, icons, and fills.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display / Headlines / Numbers | **Baloo 2** (Google Font) | Chunky, rounded, bold — matches the logo's wordmark weight. Used for headlines, level titles, big score numbers, XP counters. |
| Body / UI text | **Nunito** (Google Font) | Rounded sans, highly legible at small sizes, friendly without being silly. Used for clues, buttons, body copy. |
| Crossword grid letters | **Baloo 2**, uppercase, tabular | Grid cells need a bold, unmistakable letterform. |

**Type scale** (rem, mobile-first, fluid up on desktop):

- `text-display`: 2.75rem / Baloo 2 / 700 — hero headlines
- `text-h1`: 2rem / Baloo 2 / 700 — page titles
- `text-h2`: 1.5rem / Baloo 2 / 600 — section headers, level names
- `text-h3`: 1.125rem / Baloo 2 / 600 — card titles
- `text-body`: 1rem / Nunito / 400–600 — clues, copy
- `text-small`: 0.875rem / Nunito / 500 — meta, timestamps, helper text
- `text-mono-score`: Baloo 2 / 700, tabular-nums — for timers/scores so digits don't jitter

**Rule:** never use a thin font weight anywhere. Minimum weight is 500. This is a bold, confident brand.

---

## 4. Shape, Space & Elevation

- **Corner radius:** generous and consistent. `rounded-2xl` (16px) for cards, `rounded-full` for buttons/badges/avatars. Sharp corners don't exist in this brand.
- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64px. Cards get generous internal padding (24px+) — never cramped.
- **Elevation:** soft, warm-tinted shadows, never pure black.
  - `shadow-card`: `0 4px 16px rgba(27, 42, 107, 0.08)`
  - `shadow-float`: `0 8px 24px rgba(247, 147, 30, 0.25)` — used for the primary CTA and celebratory elements
- **Borders:** thin (1.5–2px), `--color-line`, used to separate rather than to box things in. Prefer shadow + radius over hard borders where possible.

---

## 5. The Crossword Grid — Special Component Rules

The grid is the product's centerpiece, so it gets its own rules:

- **Cell (empty):** `--color-cloud` fill, `--color-line` border, 2px radius (cells are squares with barely-rounded corners — the *only* place in the UI allowed to look more "grid" than "blob").
- **Cell (active/selected):** `--color-unicorn-orange-light` fill, `--color-unicorn-orange` 2px border, subtle scale(1.05) pop.
- **Cell (active word highlight):** `--color-xp` at 20% opacity fill for every cell in the currently-selected word.
- **Cell (correct, locked in):** `--color-success` at 15% fill, letter in `--color-unicorn-blue`, brief checkmark shimmer animation on entry.
- **Cell (wrong, shake feedback):** border flashes `--color-error`, cell does a 200ms horizontal shake, then reverts — *never* stays red. Mistakes are momentary, not shameful.
- **Blocked cell:** solid `--color-unicorn-blue-deep` fill, fully flat, no radius override.
- **Clue numbers:** tiny Nunito 600 label, top-left of cell, `--color-ink-soft`.

Clue list panel: active clue gets a pill highlight in `--color-unicorn-orange-light` and auto-scrolls into view. Completed clues get a `--color-success` checkmark and strikethrough at 70% opacity (still readable — this is a study tool, not a "hide your progress" app).

---

## 6. Motion & "Juice"

Motion is how this app earns the word "addictive" honestly — through satisfying feedback, not dark patterns. Keep everything **fast** (150–350ms) so it never slows down play.

| Moment | Animation |
|---|---|
| Correct letter typed | Cell pops scale 1 → 1.15 → 1, color fades to success green (150ms) |
| Word completed | Whole word row/col does a quick sequential shimmer sweep, +XP number floats up and fades |
| Wrong letter | Horizontal shake (3 cycles, 200ms total), soft coral flash |
| Puzzle completed | Full-screen confetti burst in brand colors, unicorn mascot animation, stats card slides up |
| Level up (avatar evolves) | Mascot silhouette "grows" with a light burst, new tier color washes across screen, name banner ("You evolved into a STALLION!") |
| Streak incremented | Flame icon pulses and ticks up with a small bounce |
| Achievement unlocked | Badge flies in from bottom, rotates into place, gold sparkle trail |
| XP bar fill | Always animates the fill (never instant-jumps), 400–600ms ease-out, ends with a tiny overshoot bounce |

**Principle:** every point earned should be *seen* being earned — numbers count up, bars fill, never just appear.

---

## 7. Gamification UI Patterns

These are the recurring building blocks used to deliver the reward systems (see `README.md` for the underlying logic):

- **XP Bar:** pill-shaped, `--color-line` track, `--color-xp` fill, avatar badge sits on the left end overlapping the bar edge.
- **Avatar Badge:** circular, ringed (echoing the logo's circle), ring color = current tier color, unicorn illustration inside evolves in visual complexity per tier (simple foal sketch → fully maned, winged, glowing alicorn).
- **Coin counter:** always top-right of the main nav, coin icon + count, gentle bounce when it increases.
- **Streak flame:** top nav, number inside a flame icon; turns from orange to grey outline if the streak is "at risk today" (softly urgent, not guilt-tripping — copy stays positive: *"Play today to keep your 6-day streak! 🔥"*).
- **Leaderboard row:** rank number in a colored medal chip for top 3 (gold/silver/bronze using `--color-coin`, `#C0C0C0`, `#CD7F32`), player avatar, name, accuracy %, time, composite score. Current player's own row is pinned and highlighted in `--color-unicorn-orange-light` even if scrolled off-screen.
- **Achievement badge:** circular medallion, icon centered, locked state = greyscale + lock icon at 40% opacity, unlocked = full color + tier-appropriate glow.
- **Level card (level-select screen):** large, tappable, shows tier color, tier mascot art, lock overlay if not yet unlocked with the XP threshold needed, progress ring showing puzzles completed / 5.
- **Toast/banner:** rounded-full pill, slides from top, auto-dismisses, used for "+XP", "+coins", "streak saved", never blocks interaction.

---

## 8. Voice & Tone

- **Always encouraging, never condescending.** "Nice! 3/10 words down." not "Only 3/10?"
- **Mistakes are data, not failure.** Wrong letters get a shake, not a sad message. No "Game Over."
- **Short and punchy.** UI copy is never a full paragraph. Clues aside, most strings are under 8 words.
- **Celebrate specifics.** "New record: 47s!" beats "Great job!"
- **English UI, German content.** All interface chrome (buttons, nav, toasts) is in English since the audience is English-speaking learners of German — only crossword answers and vocabulary are German. Never mix languages inside a single UI string.

---

## 9. Accessibility

- Color is never the *only* signal — correct/wrong/locked states always pair color with an icon or shape change (checkmark, shake, lock).
- Minimum tap target: 44×44px, including crossword grid cells on mobile (grid scales/scrolls rather than shrinking cells below this).
- Respect `prefers-reduced-motion`: swap shimmer/confetti/shake for simple opacity/color transitions.
- All interactive elements are keyboard-navigable (critical for the crossword grid itself — arrow keys move focus, Tab moves between clues).

---

## 10. Tech Mapping (Tailwind v4)

All tokens above are defined as CSS custom properties in `src/app/globals.css` under `@theme inline`, so they're usable directly as Tailwind utility classes, e.g. `bg-unicorn-orange`, `text-unicorn-blue`, `rounded-2xl`, `shadow-card`. Fonts are loaded via `next/font/google` (Baloo 2 + Nunito) and exposed as `--font-display` / `--font-body`.

---

*This document should evolve with the product. If a new reward mechanic or screen doesn't have a clear visual pattern here yet, design it in the spirit of Sections 6–7 first, then add it back to this doc.*
