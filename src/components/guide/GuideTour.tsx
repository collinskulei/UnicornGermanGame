"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";

interface Step {
  emoji: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    emoji: "🦄",
    title: "Hi, I'm Unicorn!",
    body: "Let me show you around the Unicorn Language Center real quick.",
  },
  {
    emoji: "🐴✨",
    title: "Pick Your Level",
    body: "Foal, Colt, Stallion, Pegasus, Alicorn — five levels matched to real CEFR German levels (A1 to C1). Earn XP to unlock the next one!",
  },
  {
    emoji: "👉 👈",
    title: "Swipe to Match",
    body: "You'll see a German word and a meaning. Swipe right (or tap ✓) if they match, left (or tap ✕) if they don't.",
  },
  {
    emoji: "⭐ 🪙 🔥",
    title: "Earn XP, Coins & Streaks",
    body: "Every deck you finish earns XP and Sparkle Dust, and keeps your daily streak burning. Come back each day to keep it alive!",
  },
  {
    emoji: "🏆",
    title: "Climb the Leaderboard",
    body: "Speed AND accuracy both count — see how you stack up against other learners on every level.",
  },
  {
    emoji: "🎉",
    title: "You're Ready!",
    body: "That's everything. Go earn some Sparkle Dust!",
  },
];

export function GuideTour({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-unicorn-blue-deep/70 px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-cloud p-8 text-center shadow-float"
      >
        <button
          onClick={onClose}
          aria-label="Close guide"
          className="absolute right-4 top-4 text-ink-soft transition hover:text-ink"
        >
          ✕
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center gap-3"
          >
            <span className="animate-bounce-in text-6xl">{current.emoji}</span>
            <h2 className="text-h2 text-unicorn-blue">{current.title}</h2>
            <p className="text-ink-soft">{current.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={clsx("h-2 w-2 rounded-full", i === step ? "bg-unicorn-orange" : "bg-line")}
            />
          ))}
        </div>

        <div className="mt-2 flex w-full gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-full bg-line px-4 py-2.5 font-display font-bold text-ink-soft transition hover:bg-line/70"
            >
              Back
            </button>
          )}
          {isLast ? (
            <Link
              href="/play"
              onClick={onClose}
              className="flex-1 rounded-full bg-unicorn-orange px-4 py-2.5 text-center font-display font-bold text-white shadow-float transition hover:bg-unicorn-orange-dark"
            >
              Let&apos;s Play!
            </Link>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-full bg-unicorn-orange px-4 py-2.5 font-display font-bold text-white shadow-float transition hover:bg-unicorn-orange-dark"
            >
              Next
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
