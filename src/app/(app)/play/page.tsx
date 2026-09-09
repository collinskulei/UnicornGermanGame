"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { tierForXp } from "@/lib/tiers";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { XPBar } from "@/components/ui/XPBar";

// The crossword game is hidden for now while it's reworked — this page
// intentionally shows a placeholder instead of the tier/puzzle picker.
// Nothing was deleted: the engine, puzzle data, and reward logic are
// all still in src/lib/game, src/data, src/components/crossword.
export default function PlayPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <p className="text-ink-soft">Loading your unicorn...</p>;
  }

  const currentTier = tierForXp(profile.xp);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-3 rounded-2xl bg-cloud p-6 text-center shadow-card sm:flex-row sm:text-left">
        <AvatarBadge tier={currentTier.id} size="lg" />
        <div className="flex-1">
          <h1 className="text-h2 text-unicorn-blue">
            Welcome back, {profile.username.split(" ")[0]}!
          </h1>
          <p className="mb-2 text-ink-soft">{currentTier.tagline}</p>
          <XPBar xp={profile.xp} />
        </div>
      </section>

      <section className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl bg-cloud p-10 text-center shadow-card">
        <span className="text-6xl">🦄✨</span>
        <h2 className="text-h2 text-unicorn-blue">Puzzles are getting a glow-up</h2>
        <p className="max-w-sm text-ink-soft">
          We&apos;re reworking the crossword experience. Check back soon — your progress and XP
          are safe.
        </p>
      </section>
    </div>
  );
}
