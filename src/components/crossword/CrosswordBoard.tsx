"use client";

import { useEffect } from "react";
import type { Puzzle } from "@/types";
import type { CrosswordActions, CrosswordState } from "@/lib/game/useCrossword";
import clsx from "clsx";

const GERMAN_KEYS = ["Ä", "Ö", "Ü", "ß"];
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Y", "X", "C", "V", "B", "N", "M"],
];

interface Props {
  puzzle: Puzzle;
  state: CrosswordState;
  actions: CrosswordActions;
}

export function CrosswordBoard({ puzzle, state, actions }: Props) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[a-zA-ZäöüßÄÖÜ]$/.test(e.key)) {
        e.preventDefault();
        actions.typeLetter(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        actions.backspace();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        actions.moveActive(0, 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        actions.moveActive(0, -1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        actions.moveActive(1, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        actions.moveActive(-1, 0);
      } else if (e.key === "Tab") {
        e.preventDefault();
        actions.toggleDirection();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions]);

  const activeWordCellKeys = new Set(
    state.activeWord
      ? Array.from({ length: state.activeWord.answer.length }, (_, i) => {
          const row = state.activeWord!.direction === "across" ? state.activeWord!.row : state.activeWord!.row + i;
          const col = state.activeWord!.direction === "across" ? state.activeWord!.col + i : state.activeWord!.col;
          return `${row},${col}`;
        })
      : []
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="grid select-none gap-[2px] rounded-xl bg-line p-[2px] shadow-card"
        style={{
          gridTemplateColumns: `repeat(${puzzle.width}, minmax(0, 1fr))`,
          width: "min(92vw, 34rem)",
          aspectRatio: `${puzzle.width} / ${puzzle.height}`,
        }}
      >
        {puzzle.cells.map((row, r) =>
          row.map((cell, c) => {
            if (cell.blocked) {
              return <div key={`${r}-${c}`} className="bg-unicorn-blue-deep" />;
            }
            const cellState = state.grid[r][c];
            const isActive = state.activeCell?.row === r && state.activeCell?.col === c;
            const inActiveWord = activeWordCellKeys.has(`${r},${c}`);

            return (
              <button
                type="button"
                key={`${r}-${c}`}
                onClick={() => {
                  if (isActive) actions.toggleDirection();
                  else actions.selectCell(r, c);
                }}
                className={clsx(
                  "relative flex items-center justify-center bg-cloud font-display text-[clamp(0.7rem,3vw,1.25rem)] font-bold uppercase text-ink transition-colors",
                  inActiveWord && !isActive && "bg-xp/20",
                  isActive && "bg-unicorn-orange-light ring-2 ring-unicorn-orange",
                  cellState.status === "correct" && !isActive && "bg-success/15 text-unicorn-blue",
                  cellState.justWrong && "animate-shake-wrong border-2 border-error",
                  cellState.status === "correct" && "animate-pop-correct"
                )}
              >
                {cell.number && (
                  <span className="absolute left-0.5 top-0 text-[clamp(0.45rem,1.6vw,0.6rem)] font-semibold text-ink-soft">
                    {cell.number}
                  </span>
                )}
                {cellState.value}
              </button>
            );
          })
        )}
      </div>

      <VirtualKeyboard onKey={actions.typeLetter} onBackspace={actions.backspace} />
    </div>
  );
}

function VirtualKeyboard({
  onKey,
  onBackspace,
}: {
  onKey: (letter: string) => void;
  onBackspace: () => void;
}) {
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-1.5">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((k) => (
            <KeyButton key={k} label={k} onClick={() => onKey(k)} />
          ))}
        </div>
      ))}
      <div className="flex gap-1">
        {GERMAN_KEYS.map((k) => (
          <KeyButton key={k} label={k} onClick={() => onKey(k)} highlight />
        ))}
        <KeyButton label="⌫" onClick={onBackspace} wide />
      </div>
    </div>
  );
}

function KeyButton({
  label,
  onClick,
  highlight,
  wide,
}: {
  label: string;
  onClick: () => void;
  highlight?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex h-10 items-center justify-center rounded-lg font-display text-sm font-bold shadow-sm transition active:scale-95",
        wide ? "px-4" : "w-8",
        highlight ? "bg-unicorn-orange-light text-unicorn-blue" : "bg-cloud text-ink"
      )}
    >
      {label}
    </button>
  );
}
