import type { AchievementDef } from "@/types";

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_blood",
    name: "First Blood",
    description: "Complete your very first crossword.",
    icon: "🩷",
  },
  {
    key: "perfectionist_1",
    name: "Perfectionist",
    description: "Finish a puzzle with 100% accuracy.",
    icon: "💎",
  },
  {
    key: "perfectionist_10",
    name: "Flawless Ten",
    description: "Finish 10 puzzles with 100% accuracy.",
    icon: "👑",
  },
  {
    key: "speed_demon",
    name: "Speed Demon",
    description: "Complete a puzzle in under 60 seconds.",
    icon: "⚡",
  },
  {
    key: "streak_3",
    name: "Warming Up",
    description: "Keep a 3-day play streak.",
    icon: "🔥",
  },
  {
    key: "streak_7",
    name: "Streak Master",
    description: "Keep a 7-day play streak.",
    icon: "🔥",
  },
  {
    key: "streak_30",
    name: "Unstoppable",
    description: "Keep a 30-day play streak.",
    icon: "🌟",
  },
  {
    key: "level_up_colt",
    name: "Colt Unlocked",
    description: "Evolve your unicorn into a Colt.",
    icon: "🦄",
  },
  {
    key: "level_up_stallion",
    name: "Stallion Unlocked",
    description: "Evolve your unicorn into a Stallion.",
    icon: "🦄",
  },
  {
    key: "level_up_pegasus",
    name: "Pegasus Unlocked",
    description: "Evolve your unicorn into a Pegasus.",
    icon: "🦄",
  },
  {
    key: "level_up_alicorn",
    name: "Alicorn Ascension",
    description: "Reach the legendary Alicorn tier.",
    icon: "✨",
  },
  {
    key: "polyglot_foal",
    name: "Foal Graduate",
    description: "Complete every puzzle in the Foal tier.",
    icon: "📗",
  },
  {
    key: "polyglot_colt",
    name: "Colt Graduate",
    description: "Complete every puzzle in the Colt tier.",
    icon: "📘",
  },
  {
    key: "polyglot_stallion",
    name: "Stallion Graduate",
    description: "Complete every puzzle in the Stallion tier.",
    icon: "📙",
  },
  {
    key: "polyglot_pegasus",
    name: "Pegasus Graduate",
    description: "Complete every puzzle in the Pegasus tier.",
    icon: "📕",
  },
  {
    key: "grandmaster",
    name: "Grandmaster Linguist",
    description: "Complete all 25 puzzles across every tier.",
    icon: "🏆",
  },
  {
    key: "daily_devotee",
    name: "Daily Devotee",
    description: "Complete 5 daily challenges.",
    icon: "📅",
  },
  {
    key: "no_hints",
    name: "Self-Made",
    description: "Complete 5 puzzles without using a single hint.",
    icon: "🧠",
  },
];

export function getAchievement(key: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
