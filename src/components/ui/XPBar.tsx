"use client";

import { motion } from "framer-motion";
import { xpProgressWithinTier } from "@/lib/tiers";

export function XPBar({ xp, compact }: { xp: number; compact?: boolean }) {
  const { tier, next, xpIntoTier, xpForNextTier, fraction } = xpProgressWithinTier(xp);

  return (
    <div className="flex w-full flex-col gap-1">
      {!compact && (
        <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
          <span>{tier.displayName}</span>
          <span>
            {next ? `${xpIntoTier} / ${xpForNextTier} XP to ${next.displayName}` : "Max tier reached ✨"}
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-xp"
          initial={{ width: 0 }}
          animate={{ width: `${fraction * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
