"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { useProgress } from "@/lib/game/useProgress";
import { getTier, isTierUnlocked, TIERS } from "@/lib/tiers";
import { getPuzzlesForTier } from "@/data/puzzles";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import type { TierId } from "@/types";

const VALID_TIERS = new Set(TIERS.map((t) => t.id));

export default function TierPuzzleListPage({ params }: PageProps<"/play/[tier]">) {
  const { tier: tierParam } = use(params);

  if (!VALID_TIERS.has(tierParam as TierId)) notFound();
  const tierId = tierParam as TierId;
  const tier = getTier(tierId);

  const { profile } = useAuth();
  const { best, loading } = useProgress();

  if (!profile) return <p className="text-ink-soft">Loading...</p>;

  const unlocked = isTierUnlocked(tierId, profile.xp);
  const puzzles = getPuzzlesForTier(tierId);

  if (!unlocked) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="text-h2 text-unicorn-blue">{tier.displayName} is still locked</h1>
        <p className="text-ink-soft">Reach {tier.xpRequired} XP to unlock this level.</p>
        <Link
          href="/play"
          className="mt-2 rounded-full bg-unicorn-orange px-6 py-3 font-display font-bold text-white shadow-float"
        >
          Back to Levels
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <AvatarBadge tier={tierId} size="lg" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            {tier.cefr} · Level {tier.levelNumber}
          </p>
          <h1 className="text-h1 text-unicorn-blue">{tier.displayName}</h1>
          <p className="text-ink-soft">{tier.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {puzzles.map((puzzle, i) => {
          const result = best[puzzle.id];
          return (
            <Link
              key={puzzle.id}
              href={`/play/${tierId}/${puzzle.id}`}
              className="flex flex-col gap-2 rounded-2xl bg-cloud p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-float"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase text-ink-soft">
                  Puzzle {i + 1}
                </span>
                {result && <span className="text-lg">✅</span>}
              </div>
              <p className="font-display text-lg font-bold text-unicorn-blue">{puzzle.theme}</p>
              <p className="text-sm text-ink-soft">{puzzle.words.length} words</p>
              {result && !loading && (
                <div className={clsx("mt-1 flex gap-3 text-xs font-semibold text-ink-soft")}>
                  <span>⏱ {result.timeSeconds}s</span>
                  <span>🎯 {result.accuracy}%</span>
                  <span>⭐ {result.score}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
