import clsx from "clsx";
import type { TierId } from "@/types";

const TIER_EMOJI: Record<TierId, string> = {
  foal: "🐴",
  colt: "🦄",
  stallion: "🦄",
  pegasus: "🪽",
  alicorn: "✨",
};

const TIER_RING: Record<TierId, string> = {
  foal: "ring-tier-foal",
  colt: "ring-tier-colt",
  stallion: "ring-tier-stallion",
  pegasus: "ring-tier-pegasus",
  alicorn: "ring-tier-alicorn-a",
};

export function AvatarBadge({
  tier,
  size = "md",
}: {
  tier: TierId;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "sm" ? "h-9 w-9 text-lg" : size === "lg" ? "h-20 w-20 text-4xl" : "h-12 w-12 text-2xl";
  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-full bg-cloud shadow-card ring-4",
        sizeClass,
        TIER_RING[tier]
      )}
    >
      <span>{TIER_EMOJI[tier]}</span>
    </div>
  );
}
