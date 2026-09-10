"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { XPBar } from "@/components/ui/XPBar";
import { UsernameEditor } from "@/components/profile/UsernameEditor";
import { tierForXp } from "@/lib/tiers";
import { ACHIEVEMENTS } from "@/lib/achievements";

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const [unlockedKeys, setUnlockedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("user_achievements")
      .select("achievement_key")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setUnlockedKeys(new Set((data ?? []).map((r) => r.achievement_key as string)));
      });
  }, [user]);

  if (!profile) return <p className="text-ink-soft">Loading your profile...</p>;

  const tier = tierForXp(profile.xp);

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-4 rounded-2xl bg-cloud p-6 text-center shadow-card sm:flex-row sm:text-left">
        <AvatarBadge tier={tier.id} size="lg" />
        <div className="flex-1">
          <UsernameEditor username={profile.username} />
          <p className="mb-3 text-ink-soft">
            {tier.displayName} · {tier.cefr}
          </p>
          <XPBar xp={profile.xp} />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon="⭐" label="Total XP" value={profile.xp} />
        <StatCard icon="🪙" label="Sparkle Dust" value={profile.coins} />
        <StatCard icon="🔥" label="Current Streak" value={`${profile.currentStreak}d`} />
        <StatCard icon="🏆" label="Best Streak" value={`${profile.longestStreak}d`} />
      </section>

      <section>
        <h2 className="mb-3 text-h2 text-unicorn-blue">Achievements</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedKeys.has(a.key);
            return (
              <div
                key={a.key}
                className={clsx(
                  "flex flex-col items-center gap-1 rounded-2xl p-4 text-center shadow-card",
                  unlocked ? "bg-cloud ring-2 ring-coin" : "bg-cloud/60 grayscale"
                )}
              >
                <span className="text-3xl">{unlocked ? a.icon : "🔒"}</span>
                <p className="font-display text-sm font-bold text-unicorn-blue">{a.name}</p>
                <p className="text-xs text-ink-soft">{a.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-cloud p-4 text-center shadow-card">
      <span className="text-2xl">{icon}</span>
      <span className="font-display text-xl font-bold text-unicorn-blue">{value}</span>
      <span className="text-xs font-semibold text-ink-soft">{label}</span>
    </div>
  );
}
