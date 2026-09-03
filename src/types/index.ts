// Core domain types shared across the app.

export type TierId = "foal" | "colt" | "stallion" | "pegasus" | "alicorn";

export interface TierDef {
  id: TierId;
  levelNumber: 1 | 2 | 3 | 4 | 5;
  cefr: "A1" | "A2" | "B1" | "B2" | "C1";
  displayName: string;
  tagline: string;
  xpRequired: number; // total XP needed to REACH this tier
  color: string; // tailwind class token, see tiers.ts
}

export interface Direction {
  row: number;
  col: number;
}

export type EntryDirection = "across" | "down";

export interface PuzzleWord {
  id: string; // e.g. "1-across"
  number: number;
  answer: string; // uppercase German word, letters only (Ä/Ö/Ü/ß allowed)
  clue: string; // English clue
  direction: EntryDirection;
  row: number; // 0-indexed start row
  col: number; // 0-indexed start col
}

export interface PuzzleCell {
  row: number;
  col: number;
  blocked: boolean;
  solution?: string; // single character, uppercase
  number?: number; // clue number label, if this cell starts a word
}

export interface Puzzle {
  id: string; // e.g. "foal-1"
  tier: TierId;
  theme: string;
  width: number;
  height: number;
  cells: PuzzleCell[][]; // [row][col]
  words: PuzzleWord[];
}

export interface PuzzleSummary {
  id: string;
  tier: TierId;
  theme: string;
  wordCount: number;
}

// --- Player / persistence ---

export interface PlayerProfile {
  id: string;
  username: string;
  avatarUrl?: string | null;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null; // ISO date (yyyy-mm-dd)
  createdAt: string;
}

export interface PuzzleAttempt {
  id: string;
  userId: string;
  tier: TierId;
  puzzleId: string;
  timeSeconds: number;
  accuracy: number; // 0-100
  hintsUsed: number;
  score: number;
  completedAt: string;
}

export interface LeaderboardRow {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  tier: TierId;
  bestTimeSeconds: number;
  bestAccuracy: number;
  score: number;
  rank: number;
}

export interface AchievementDef {
  key: string;
  name: string;
  description: string;
  icon: string; // emoji or icon key
}

export interface UnlockedAchievement {
  key: string;
  unlockedAt: string;
}
