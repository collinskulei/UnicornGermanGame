"use client";

import clsx from "clsx";
import type { Puzzle } from "@/types";
import type { CrosswordState, CrosswordActions } from "@/lib/game/useCrossword";

interface Props {
  puzzle: Puzzle;
  state: CrosswordState;
  actions: CrosswordActions;
}

export function ClueList({ puzzle, state, actions }: Props) {
  const across = puzzle.words.filter((w) => w.direction === "across").sort((a, b) => a.number - b.number);
  const down = puzzle.words.filter((w) => w.direction === "down").sort((a, b) => a.number - b.number);

  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
      <ClueColumn title="Across" words={across} state={state} actions={actions} />
      <ClueColumn title="Down" words={down} state={state} actions={actions} />
    </div>
  );
}

function ClueColumn({
  title,
  words,
  state,
  actions,
}: {
  title: string;
  words: Puzzle["words"];
  state: CrosswordState;
  actions: CrosswordActions;
}) {
  return (
    <div>
      <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-ink-soft">
        {title}
      </h3>
      <ul className="flex flex-col gap-1">
        {words.map((word) => {
          const isActive = state.activeWord?.id === word.id;
          const isDone = state.completedWordIds.has(word.id);
          return (
            <li key={word.id}>
              <button
                type="button"
                onClick={() => actions.selectWord(word)}
                className={clsx(
                  "flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition",
                  isActive && "bg-unicorn-orange-light/60",
                  isDone && "opacity-60"
                )}
              >
                <span className="mt-0.5 font-display font-bold text-unicorn-blue">{word.number}.</span>
                <span className={clsx(isDone && "text-success line-through")}>{word.clue}</span>
                {isDone && <span className="ml-auto shrink-0">✅</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
