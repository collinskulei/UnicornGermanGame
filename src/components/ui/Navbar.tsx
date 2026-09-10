"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/lib/auth/AuthContext";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { GuideMeButton } from "@/components/guide/GuideMeButton";
import { tierForXp } from "@/lib/tiers";

const NAV_LINKS = [
  { href: "/play", label: "Play" },
  { href: "/leaderboard/foal", label: "Leaderboard", matchPrefix: "/leaderboard" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const tier = profile ? tierForXp(profile.xp) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/play" className="flex items-center gap-2">
          <span className="text-2xl">🦄</span>
          <span className="font-display text-lg font-bold text-unicorn-blue">Unicorn German</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const active = link.matchPrefix
              ? pathname.startsWith(link.matchPrefix)
              : pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-full px-4 py-2 font-display text-sm font-bold transition",
                  active ? "bg-unicorn-orange-light text-unicorn-blue" : "text-ink-soft hover:text-unicorn-blue"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {profile && tier ? (
          <div className="flex items-center gap-3">
            <GuideMeButton />
            <div className="hidden items-center gap-1 rounded-full bg-cloud px-3 py-1.5 shadow-card sm:flex">
              <span className="text-streak">🔥</span>
              <span className="font-display text-sm font-bold text-ink">{profile.currentStreak}</span>
            </div>
            <div className="hidden items-center gap-1 rounded-full bg-cloud px-3 py-1.5 shadow-card sm:flex">
              <span>🪙</span>
              <span className="font-display text-sm font-bold text-ink">{profile.coins}</span>
            </div>
            <Link href="/profile">
              <AvatarBadge tier={tier.id} size="sm" />
            </Link>
            <button
              onClick={signOut}
              className="hidden text-xs font-semibold text-ink-soft hover:text-unicorn-blue sm:inline"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>

      <nav className="flex items-center justify-around border-t border-line bg-cream px-2 py-1.5 sm:hidden">
        {NAV_LINKS.map((link) => {
          const active = link.matchPrefix ? pathname.startsWith(link.matchPrefix) : pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-full px-3 py-1.5 font-display text-xs font-bold",
                active ? "bg-unicorn-orange-light text-unicorn-blue" : "text-ink-soft"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
