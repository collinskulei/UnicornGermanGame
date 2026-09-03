import { create } from "zustand";
import type { AchievementDef, TierDef } from "@/types";

export interface Toast {
  id: string;
  kind: "xp" | "coins" | "streak" | "info";
  message: string;
}

interface LevelUpPayload {
  tier: TierDef;
}

interface AchievementPayload {
  achievement: AchievementDef;
}

interface CelebrationState {
  toasts: Toast[];
  levelUp: LevelUpPayload | null;
  achievementQueue: AchievementPayload[];

  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
  triggerLevelUp: (tier: TierDef) => void;
  clearLevelUp: () => void;
  queueAchievement: (achievement: AchievementDef) => void;
  dequeueAchievement: () => void;
}

export const useCelebrationStore = create<CelebrationState>((set) => ({
  toasts: [],
  levelUp: null,
  achievementQueue: [],

  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  triggerLevelUp: (tier) => set({ levelUp: { tier } }),
  clearLevelUp: () => set({ levelUp: null }),

  queueAchievement: (achievement) =>
    set((state) => ({ achievementQueue: [...state.achievementQueue, { achievement }] })),

  dequeueAchievement: () =>
    set((state) => ({ achievementQueue: state.achievementQueue.slice(1) })),
}));
