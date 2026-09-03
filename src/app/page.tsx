"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";
import { TIERS } from "@/lib/tiers";
import { AvatarBadge } from "@/components/ui/AvatarBadge";

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
  const { user, loading, signInWithGoogle } = useAuth();
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

        <button
          onClick={signInWithGoogle}
          className="mt-2 flex items-center gap-3 rounded-full bg-unicorn-orange px-8 py-4 font-display text-lg font-bold text-white shadow-float transition hover:-translate-y-0.5 hover:bg-unicorn-orange-dark"
        >
          <GoogleIcon />
          Sign in with Google to Play
        </button>
        <p className="text-xs text-ink-soft">Free to play. Takes 10 seconds.</p>
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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.4 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.5 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.4C41.5 35.9 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
