"use client";

import { SwipeCard } from "@/components/swipe/SwipeCard";
import type { useSwipeMatch } from "@/lib/game/useSwipeMatch";

interface Props {
  state: ReturnType<typeof useSwipeMatch>["state"];
  actions: ReturnType<typeof useSwipeMatch>["actions"];
}

export function SwipeDeck({ state, actions }: Props) {
  if (!state.ready) {
    return (
      <div className="flex h-80 w-72 animate-pulse items-center justify-center rounded-3xl bg-cloud/70 shadow-card">
        <span className="text-4xl">🦄</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-xs items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-unicorn-orange transition-[width] duration-300"
            style={{ width: `${(state.index / state.deck.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-ink-soft">
          {state.index}/{state.deck.length}
        </span>
      </div>

      <div className="relative flex h-80 w-72 items-center justify-center">
        {state.nextCard && (
          <div className="absolute inset-0 translate-y-2 scale-[0.96] rounded-3xl bg-cloud/70 shadow-card" />
        )}
        {state.currentCard && (
          <SwipeCard key={state.currentCard.id} card={state.currentCard} onResolved={actions.swipe} />
        )}
      </div>

      <p className="text-xs text-ink-soft">
        Drag right if it&apos;s a real match, left if it isn&apos;t — or tap ✕ / ✓.
      </p>
    </div>
  );
}
