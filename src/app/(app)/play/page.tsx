"use client";

import Link from "next/link";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { useProgress } from "@/lib/game/useProgress";
import { TIERS, isTierUnlocked, tierForXp } from "@/lib/tiers";
import { XPBar } from "@/components/ui/XPBar";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { getDailyPuzzle } from "@/lib/game/dailyChallenge";
import { getPuzzlesForTier } from "@/data/puzzles";
import type { TierId } from "@/types";

const TIER_BAR_CLASS: Record<TierId, string> = {
  foal: "bg-tier-foal",
  colt: "bg-tier-colt",
  stallion: "bg-tier-stallion",
  pegasus: "bg-tier-pegasus",
  alicorn: "bg-tier-alicorn-a",
};

export default function PlayPage() {
  const { profile } = useAuth();
  const { completedCountForTier, loading } = useProgress();

  if (!profile) {
    return <p className="text-ink-soft">Loading your unicorn...</p>;
  }

  const daily = getDailyPuzzle(profile.xp);
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

      <Link
        href={`/play/${daily.tier}/${daily.id}?daily=1`}
        className="flex items-center gap-4 rounded-2xl bg-unicorn-blue p-5 text-cloud shadow-float transition hover:brightness-110"
      >
        <span className="text-4xl">📅</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-unicorn-orange-light">
            Today&apos;s Daily Challenge
          </p>
          <p className="font-display text-lg font-bold">{daily.theme}</p>
          <p className="text-sm text-cloud/80">+50% bonus XP · resets at midnight UTC</p>
        </div>
      </Link>

      <section>
        <h2 className="mb-3 text-h2 text-unicorn-blue">Choose a Level</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TIERS.map((tier) => {
            const unlocked = isTierUnlocked(tier.id, profile.xp);
            const total = getPuzzlesForTier(tier.id).length;
            const completed = completedCountForTier(tier.id);

            const card = (
              <div
                className={clsx(
                  "flex flex-col gap-3 rounded-2xl p-5 shadow-card transition",
                  unlocked ? "bg-cloud hover:-translate-y-0.5 hover:shadow-float" : "bg-cloud/60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AvatarBadge tier={tier.id} />
                    <div>
                      <p className="font-display text-lg font-bold text-unicorn-blue">
                        {tier.displayName}
                      </p>
                      <p className="text-xs font-semibold uppercase text-ink-soft">
                        {tier.cefr} · Level {tier.levelNumber}
                      </p>
                    </div>
                  </div>
                  {!unlocked && <span className="text-2xl">🔒</span>}
                </div>

                {unlocked ? (
                  <>
                    <p className="text-sm text-ink-soft">{tier.tagline}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                        <div
                          className={clsx("h-full rounded-full", TIER_BAR_CLASS[tier.id])}
                          style={{ width: `${loading ? 0 : (completed / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-ink-soft">
                        {completed}/{total}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm font-semibold text-ink-soft">
                    Reach {tier.xpRequired} XP to unlock
                  </p>
                )}
              </div>
            );

            return unlocked ? (
              <Link key={tier.id} href={`/play/${tier.id}`}>
                {card}
              </Link>
            ) : (
              <div key={tier.id} className="cursor-not-allowed">
                {card}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
