"use client";

import { motion, useMotionValue, useTransform, animate, type PanInfo } from "framer-motion";
import type { SwipeCardData } from "@/lib/game/useSwipeMatch";

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 500;

interface Props {
  card: SwipeCardData;
  onResolved: (direction: "left" | "right") => void;
}

export function SwipeCard({ card, onResolved }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-18, 18]);
  const matchOpacity = useTransform(x, [10, 120], [0, 1]);
  const noMatchOpacity = useTransform(x, [-120, -10], [1, 0]);

  function resolve(direction: "left" | "right") {
    const target = direction === "right" ? 520 : -520;
    animate(x, target, { type: "spring", stiffness: 260, damping: 26 });
    setTimeout(() => onResolved(direction), 160);
  }

  function handleDragEnd(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      resolve("right");
    } else if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      resolve("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 24 });
    }
  }

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="relative flex h-80 w-72 select-none flex-col items-center justify-center gap-4 rounded-3xl bg-cloud p-6 text-center shadow-float"
      whileTap={{ cursor: "grabbing" }}
    >
      <motion.div
        style={{ opacity: matchOpacity }}
        className="absolute right-5 top-5 rotate-12 rounded-full border-4 border-unicorn-orange px-3 py-1 font-display text-lg font-extrabold text-unicorn-orange"
      >
        MATCH
      </motion.div>
      <motion.div
        style={{ opacity: noMatchOpacity }}
        className="absolute left-5 top-5 -rotate-12 rounded-full border-4 border-unicorn-blue px-3 py-1 font-display text-lg font-extrabold text-unicorn-blue"
      >
        NO MATCH
      </motion.div>

      <p className="font-display text-3xl font-bold text-unicorn-blue">{card.german}</p>
      <div className="h-px w-16 bg-line" />
      <p className="text-ink-soft">{card.shownText}</p>

      <div className="mt-2 flex gap-4">
        <button
          type="button"
          onClick={() => resolve("left")}
          aria-label="No match"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-unicorn-blue text-2xl text-white shadow-card transition hover:brightness-110 active:scale-95"
        >
          ✕
        </button>
        <button
          type="button"
          onClick={() => resolve("right")}
          aria-label="Match"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-unicorn-orange text-2xl text-white shadow-card transition hover:brightness-110 active:scale-95"
        >
          ✓
        </button>
      </div>
    </motion.div>
  );
}
