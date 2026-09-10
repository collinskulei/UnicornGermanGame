"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { PlayerProfile } from "@/types";

export type MagicLinkResult = { status: "sent" } | { status: "error"; message: string };

interface AuthContextValue {
  user: User | null;
  profile: PlayerProfile | null;
  loading: boolean;
  sendMagicLink: (email: string) => Promise<MagicLinkResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUsername: (username: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function rowToProfile(row: Record<string, unknown>): PlayerProfile {
  return {
    id: row.id as string,
    username: row.username as string,
    avatarUrl: row.avatar_url as string | null,
    xp: row.xp as number,
    coins: row.coins as number,
    currentStreak: row.current_streak as number,
    longestStreak: row.longest_streak as number,
    lastPlayedDate: row.last_played_date as string | null,
    createdAt: row.created_at as string,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) setProfile(rowToProfile(data));
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // One call handles both signup and login: Supabase creates the account
  // automatically on first use (shouldCreateUser) and always emails the
  // same magic link either way — no password, no separate signup step.
  const sendMagicLink = useCallback(
    async (email: string): Promise<MagicLinkResult> => {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) return { status: "error", message: error.message };
      return { status: "sent" };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const updateUsername = useCallback(
    async (username: string): Promise<{ error?: string }> => {
      if (!user) return { error: "Not signed in." };
      const trimmed = username.trim();
      if (trimmed.length < 2 || trimmed.length > 24) {
        return { error: "Username must be 2-24 characters." };
      }
      const { error } = await supabase.from("profiles").update({ username: trimmed }).eq("id", user.id);
      if (error) return { error: error.message };
      await fetchProfile(user.id);
      return {};
    },
    [supabase, user, fetchProfile]
  );

  const value = useMemo(
    () => ({ user, profile, loading, sendMagicLink, signOut, refreshProfile, updateUsername }),
    [user, profile, loading, sendMagicLink, signOut, refreshProfile, updateUsername]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
