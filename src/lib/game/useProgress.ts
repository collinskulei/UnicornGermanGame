"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import type { TierId } from "@/types";

export interface PuzzleBest {
  puzzleId: string;
  tier: TierId;
  score: number;
  timeSeconds: number;
  accuracy: number;
}

export function useProgress() {
  const { user } = useAuth();
  const [best, setBest] = useState<Record<string, PuzzleBest>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // signed out: fall through to the empty defaults below
    let active = true;
    const supabase = createClient();

    supabase
      .from("best_attempt_per_puzzle")
      .select("puzzle_id, tier, score, time_seconds, accuracy")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active || !data) return;
        const map: Record<string, PuzzleBest> = {};
        for (const row of data) {
          map[row.puzzle_id] = {
            puzzleId: row.puzzle_id,
            tier: row.tier as TierId,
            score: row.score,
            timeSeconds: row.time_seconds,
            accuracy: Number(row.accuracy),
          };
        }
        setBest(map);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const effectiveBest = user ? best : {};
  const effectiveLoading = user ? loading : false;

  const completedCountForTier = (tier: TierId) =>
    Object.values(effectiveBest).filter((b) => b.tier === tier).length;

  return { best: effectiveBest, loading: effectiveLoading, completedCountForTier };
}
