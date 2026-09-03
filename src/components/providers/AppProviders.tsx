"use client";

import { AuthProvider } from "@/lib/auth/AuthContext";
import { CelebrationLayer } from "@/components/providers/CelebrationLayer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <CelebrationLayer />
    </AuthProvider>
  );
}
