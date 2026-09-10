"use client";

import { useEffect, useState } from "react";
import type { Puzzle } from "@/types";

export interface SwipeCardData {
  id: string;
  german: string;
  shownText: string;
  isMatch: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ~Half the deck pairs a word with its real meaning ("match"), the rest
// pair it with another word's meaning from the same deck ("no match") —
// the classic Tinder-style true/false swipe.
function buildDeck(puzzle: Puzzle): SwipeCardData[] {
  const words = puzzle.words;
  const distractorPool = shuffle(words);

  const cards = words.map((word, i) => {
    const isMatch = Math.random() < 0.5 || words.length < 2;
    if (isMatch) {
      return { id: `${word.id}-t`, german: word.answer, shownText: word.clue, isMatch: true };
    }
    let distractor = distractorPool[i];
    if (distractor.answer === word.answer) {
      distractor = distractorPool[(i + 1) % distractorPool.length];
    }
    return { id: `${word.id}-f`, german: word.answer, shownText: distractor.clue, isMatch: false };
  });

  return shuffle(cards);
}

export function useSwipeMatch(puzzle: Puzzle) {
  // The deck's shuffle uses Math.random(), which must never run during
  // SSR (the server and the client would each roll different shuffles,
  // producing a hydration mismatch). Building it in an effect keeps the
  // very first render — server and client alike — an empty, matching
  // "loading" deck, then fills it in once we're safely client-side.
  const [deck, setDeck] = useState<SwipeCardData[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    // Deliberately client-only (see comment above) — this can't be a
    // lazy useState initializer without reintroducing the SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDeck(buildDeck(puzzle));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);

  const ready = deck.length > 0;
  const isComplete = ready && index >= deck.length;

  useEffect(() => {
    if (!ready || isComplete) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [ready, isComplete]);

  function swipe(direction: "left" | "right") {
    if (isComplete) return;
    const card = deck[index];
    const userSaysMatch = direction === "right";
    if (userSaysMatch === card.isMatch) setCorrectCount((c) => c + 1);
    setIndex((i) => i + 1);
  }

  const accuracy = index === 0 ? 100 : Math.round((correctCount / index) * 100);

  return {
    state: {
      ready,
      deck,
      index,
      currentCard: deck[index] ?? null,
      nextCard: deck[index + 1] ?? null,
      correctCount,
      elapsedSeconds,
      accuracy,
      isComplete,
    },
    actions: { swipe },
  };
}
