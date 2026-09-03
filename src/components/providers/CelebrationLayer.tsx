"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useCelebrationStore } from "@/lib/store/celebrationStore";

const BRAND_CONFETTI_COLORS = ["#F7931E", "#1B2A6B", "#FFC93C", "#3DDC84", "#7DD3F7"];

export function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: BRAND_CONFETTI_COLORS,
  });
}

function ToastStack() {
  const toasts = useCelebrationStore((s) => s.toasts);
  const dismissToast = useCelebrationStore((s) => s.dismissToast);

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => dismissToast(t.id), 2400)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismissToast]);

  const iconFor = (kind: string) =>
    kind === "xp" ? "⭐" : kind === "coins" ? "🪙" : kind === "streak" ? "🔥" : "✨";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="flex items-center gap-2 rounded-full bg-unicorn-blue px-5 py-2 font-display text-sm font-bold text-white shadow-float"
          >
            <span>{iconFor(toast.kind)}</span>
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function LevelUpModal() {
  const levelUp = useCelebrationStore((s) => s.levelUp);
  const clearLevelUp = useCelebrationStore((s) => s.clearLevelUp);

  useEffect(() => {
    if (levelUp) fireConfetti();
  }, [levelUp]);

  if (!levelUp) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-unicorn-blue-deep/70 px-6 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex max-w-sm flex-col items-center gap-3 rounded-2xl bg-cloud p-8 text-center shadow-float"
      >
        <div className="text-7xl">🦄</div>
        <p className="text-sm font-bold uppercase tracking-wide text-unicorn-orange">
          Level Up!
        </p>
        <h2 className="text-h1 text-unicorn-blue">
          You evolved into a {levelUp.tier.displayName}!
        </h2>
        <p className="text-ink-soft">{levelUp.tier.tagline}</p>
        <button
          onClick={clearLevelUp}
          className="mt-2 rounded-full bg-unicorn-orange px-6 py-3 font-display font-bold text-white shadow-float transition hover:bg-unicorn-orange-dark"
        >
          Let&apos;s go!
        </button>
      </motion.div>
    </div>
  );
}

function AchievementToast() {
  const queue = useCelebrationStore((s) => s.achievementQueue);
  const dequeue = useCelebrationStore((s) => s.dequeueAchievement);
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dequeue, 3200);
    return () => clearTimeout(timer);
  }, [current, dequeue]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.achievement.key}
            initial={{ y: 60, opacity: 0, rotate: -4 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex items-center gap-3 rounded-2xl bg-cloud px-5 py-3 shadow-float ring-2 ring-coin"
          >
            <span className="text-3xl">{current.achievement.icon}</span>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wide text-unicorn-orange">
                Achievement Unlocked
              </p>
              <p className="font-display font-bold text-unicorn-blue">
                {current.achievement.name}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CelebrationLayer() {
  return (
    <>
      <ToastStack />
      <LevelUpModal />
      <AchievementToast />
    </>
  );
}
