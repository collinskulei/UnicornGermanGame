"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { TIERS, getTier } from "@/lib/tiers";
import type { TierId } from "@/types";

const VALID_TIERS = new Set(TIERS.map((t) => t.id));

interface Row {
  user_id: string;
  username: string;
  avatar_url: string | null;
  total_score: number;
  total_time_seconds: number;
  avg_accuracy: number;
  puzzles_completed: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage({ params }: PageProps<"/leaderboard/[tier]">) {
  const { tier: tierParam } = use(params);
  if (!VALID_TIERS.has(tierParam as TierId)) notFound();
  const tier = tierParam as TierId;

  // Keyed by tier: switching tabs reuses this route without an unmount,
  // so the key forces a fresh fetch/loading state per tier instead of
  // flashing the previous tier's rows.
  return <LeaderboardTable key={tier} tier={tier} />;
}

function LeaderboardTable({ tier }: { tier: TierId }) {
  const tierDef = getTier(tier);
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    supabase
      .from("tier_leaderboard")
      .select("*")
      .eq("tier", tier)
      .order("total_score", { ascending: false })
      .order("total_time_seconds", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (!active) return;
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tier]);

  const myIndex = rows.findIndex((r) => r.user_id === user?.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1 text-unicorn-blue">Leaderboard</h1>
        <p className="text-ink-soft">Ranked by total score — accuracy and speed both count.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIERS.map((t) => (
          <Link
            key={t.id}
            href={`/leaderboard/${t.id}`}
            className={clsx(
              "rounded-full px-4 py-2 font-display text-sm font-bold transition",
              t.id === tier ? "bg-unicorn-orange text-white" : "bg-cloud text-ink-soft hover:text-unicorn-blue"
            )}
          >
            {t.displayName}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl bg-cloud shadow-card">
        {loading ? (
          <p className="p-6 text-center text-ink-soft">Loading rankings...</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-center text-ink-soft">
            No scores yet for {tierDef.displayName}. Be the first!
          </p>
        ) : (
          <ul>
            {rows.map((row, i) => (
              <li
                key={row.user_id}
                className={clsx(
                  "flex items-center gap-3 border-b border-line px-4 py-3 last:border-none",
                  row.user_id === user?.id && "bg-unicorn-orange-light/50"
                )}
              >
                <span className="w-8 text-center font-display font-bold text-ink-soft">
                  {MEDAL[i] ?? i + 1}
                </span>
                {row.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-line text-sm">
                    🦄
                  </span>
                )}
                <span className="flex-1 truncate font-semibold text-ink">{row.username}</span>
                <span className="hidden text-sm text-ink-soft sm:inline">
                  {row.puzzles_completed}/5 puzzles
                </span>
                <span className="hidden text-sm text-ink-soft sm:inline">{row.avg_accuracy}%</span>
                <span className="hidden text-sm text-ink-soft sm:inline">{row.total_time_seconds}s</span>
                <span className="font-display font-bold text-unicorn-blue">{row.total_score}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!loading && myIndex === -1 && user && (
        <p className="text-center text-sm text-ink-soft">
          You haven&apos;t completed any {tierDef.displayName} puzzles yet — solve one to join the board!
        </p>
      )}
    </div>
  );
}
