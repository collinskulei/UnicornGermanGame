"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/play");
  }, [loading, user, router]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
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

      <LoginForm />
    </main>
  );
}
