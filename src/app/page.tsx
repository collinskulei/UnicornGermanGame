"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";
import { TIERS } from "@/lib/tiers";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { LoginForm } from "@/components/auth/LoginForm";

const FEATURES = [
  {
    icon: "🧩",
    title: "5 Levels of Challenge",
    body: "From Foal (A1) to Alicorn (C1) — crosswords that grow with your German.",
  },
  {
    icon: "🔥",
    title: "Daily Streaks & Challenges",
    body: "A fresh daily puzzle and streak rewards keep you coming back.",
  },
  {
    icon: "🏆",
    title: "Live Leaderboards",
    body: "Ranked by speed and accuracy, per level. Climb to the top.",
  },
  {
    icon: "🦄",
    title: "Evolving Unicorn Avatar",
    body: "Earn XP to evolve your unicorn — and unlock new levels as you go.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/play");
  }, [loading, user, router]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-6 pb-16 pt-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="text-7xl"
        >
          🦄
        </motion.div>
        <h1 className="max-w-xl text-display text-unicorn-blue">
          Learn German. <span className="text-unicorn-orange">Chase the Sparkle.</span>
        </h1>
        <p className="max-w-md text-lg text-ink-soft">
          A crossword quest built for young learners in Kenya — solve puzzles, level up your
          unicorn, and race friends to the top of the leaderboard.
        </p>

        <LoginForm />
        <p className="text-xs text-ink-soft">Free to play. No password to remember.</p>
      </section>

      <section className="flex flex-wrap items-center justify-center gap-4 px-6 pb-16">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className="flex flex-col items-center gap-2"
          >
            <AvatarBadge tier={tier.id} size="md" />
            <span className="font-display text-xs font-bold text-ink-soft">{tier.displayName}</span>
          </motion.div>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex gap-4 rounded-2xl bg-cloud p-5 shadow-card">
            <span className="text-3xl">{f.icon}</span>
            <div>
              <p className="font-display font-bold text-unicorn-blue">{f.title}</p>
              <p className="text-sm text-ink-soft">{f.body}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-soft">
        🦄 Unicorn Language Center — German Crossword Quest
      </footer>
    </main>
  );
}
