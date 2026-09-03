"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Puzzle, PuzzleWord, EntryDirection } from "@/types";

export interface CellState {
  value: string; // "" or a single uppercase letter the player typed
  status: "empty" | "filled" | "correct"; // "correct" cells lock and can't be edited
  justWrong: boolean; // transient, drives the shake animation
}

interface Position {
  row: number;
  col: number;
}

export interface CrosswordState {
  grid: CellState[][];
  activeCell: Position | null;
  activeDirection: EntryDirection;
  activeWord: PuzzleWord | null;
  elapsedSeconds: number;
  hintsUsed: number;
  isComplete: boolean;
  accuracy: number; // 0-100, based on wrong keystrokes vs total letters
  completedWordIds: Set<string>;
}

export interface CrosswordActions {
  selectCell: (row: number, col: number) => void;
  typeLetter: (letter: string) => void;
  backspace: () => void;
  moveActive: (dRow: number, dCol: number) => void;
  toggleDirection: () => void;
  selectWord: (word: PuzzleWord) => void;
  useHint: () => void;
  pause: () => void;
  resume: () => void;
}

function letterAt(puzzle: Puzzle, row: number, col: number): string | null {
  const cell = puzzle.cells[row]?.[col];
  if (!cell || cell.blocked) return null;
  return cell.solution ?? null;
}

function wordAt(puzzle: Puzzle, row: number, col: number, dir: EntryDirection): PuzzleWord | null {
  return (
    puzzle.words.find((w) => {
      if (w.direction !== dir) return false;
      if (dir === "across") {
        return w.row === row && col >= w.col && col < w.col + w.answer.length;
      }
      return w.col === col && row >= w.row && row < w.row + w.answer.length;
    }) ?? null
  );
}

// A cell often only belongs to one direction's word (this grid isn't a
// fully-filled NYT-style grid). Typing/navigation must follow whichever
// direction actually has a word here, not blindly trust stale UI state —
// otherwise advancing after a correct letter can walk off into a
// direction with no word and silently stop moving.
function resolveDirection(
  puzzle: Puzzle,
  row: number,
  col: number,
  preferred: EntryDirection
): EntryDirection {
  if (wordAt(puzzle, row, col, preferred)) return preferred;
  const other: EntryDirection = preferred === "across" ? "down" : "across";
  if (wordAt(puzzle, row, col, other)) return other;
  return preferred;
}

function cellsOfWord(word: PuzzleWord): Position[] {
  return Array.from({ length: word.answer.length }, (_, i) => ({
    row: word.direction === "across" ? word.row : word.row + i,
    col: word.direction === "across" ? word.col + i : word.col,
  }));
}

function firstPlayableCell(puzzle: Puzzle): Position | null {
  for (let r = 0; r < puzzle.height; r++) {
    for (let c = 0; c < puzzle.width; c++) {
      if (!puzzle.cells[r][c].blocked) return { row: r, col: c };
    }
  }
  return null;
}

/**
 * All state here is seeded once from `puzzle` via lazy initializers.
 * Callers MUST remount this hook when switching puzzles (e.g. render the
 * component that calls it with `key={puzzle.id}`) rather than relying on
 * effects to reset state — otherwise a stale grid/timer from puzzle A
 * would bleed into puzzle B on client-side navigation.
 */
export function useCrossword(puzzle: Puzzle) {
  const [grid, setGrid] = useState<CellState[][]>(() =>
    puzzle.cells.map((row) =>
      row.map((c) => ({
        value: "",
        status: c.blocked ? "empty" : "empty",
        justWrong: false,
      }))
    )
  );
  const [activeCell, setActiveCell] = useState<Position | null>(() => firstPlayableCell(puzzle));
  const [activeDirection, setActiveDirection] = useState<EntryDirection>("across");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [wrongKeystrokes, setWrongKeystrokes] = useState(0);

  const shakeTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const completedWordIds = useMemo(() => {
    const done = new Set<string>();
    for (const word of puzzle.words) {
      const allCorrect = cellsOfWord(word).every(
        (pos) => grid[pos.row]?.[pos.col]?.status === "correct"
      );
      if (allCorrect) done.add(word.id);
    }
    return done;
  }, [puzzle.words, grid]);

  const isComplete = completedWordIds.size === puzzle.words.length;
  // Derived, not stored: the timer/typing stop the instant the last word
  // locks in, without a setState-in-effect round-trip.
  const effectivePaused = paused || isComplete;

  useEffect(() => {
    if (effectivePaused) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [effectivePaused]);

  const effectiveDirection = useMemo(
    () => (activeCell ? resolveDirection(puzzle, activeCell.row, activeCell.col, activeDirection) : activeDirection),
    [puzzle, activeCell, activeDirection]
  );

  const activeWord = useMemo(() => {
    if (!activeCell) return null;
    return wordAt(puzzle, activeCell.row, activeCell.col, effectiveDirection);
  }, [puzzle, activeCell, effectiveDirection]);

  const accuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    const correct = totalKeystrokes - wrongKeystrokes;
    return Math.max(0, Math.round((correct / totalKeystrokes) * 100));
  }, [totalKeystrokes, wrongKeystrokes]);

  const selectCell = useCallback(
    (row: number, col: number) => {
      if (puzzle.cells[row]?.[col]?.blocked) return;
      setActiveCell({ row, col });
    },
    [puzzle.cells]
  );

  const selectWord = useCallback((word: PuzzleWord) => {
    setActiveDirection(word.direction);
    setActiveCell({ row: word.row, col: word.col });
  }, []);

  const toggleDirection = useCallback(() => {
    setActiveDirection((d) => (d === "across" ? "down" : "across"));
  }, []);

  const advanceWithinWord = useCallback(
    (from: Position, dir: EntryDirection) => {
      const next =
        dir === "across" ? { row: from.row, col: from.col + 1 } : { row: from.row + 1, col: from.col };
      if (!puzzle.cells[next.row]?.[next.col] || puzzle.cells[next.row][next.col].blocked) return;
      setActiveCell(next);
    },
    [puzzle.cells]
  );

  const typeLetter = useCallback(
    (rawLetter: string) => {
      if (!activeCell || effectivePaused) return;
      if (grid[activeCell.row][activeCell.col].status === "correct") {
        // Already solved, usually via a crossing word — glide through
        // instead of stalling the cursor here.
        advanceWithinWord(activeCell, effectiveDirection);
        return;
      }

      const letter = rawLetter.toUpperCase();
      const solution = letterAt(puzzle, activeCell.row, activeCell.col);
      if (!solution) return;

      setTotalKeystrokes((n) => n + 1);

      const key = `${activeCell.row},${activeCell.col}`;
      const correct = letter === solution;

      setGrid((g) => {
        const next = g.map((r) => r.map((c) => ({ ...c })));
        const cell = next[activeCell.row][activeCell.col];
        cell.value = letter;
        cell.status = correct ? "correct" : "filled";
        cell.justWrong = !correct;
        return next;
      });

      if (!correct) {
        setWrongKeystrokes((n) => n + 1);
        const existing = shakeTimers.current.get(key);
        if (existing) clearTimeout(existing);
        const timer = setTimeout(() => {
          setGrid((g) => {
            const next = g.map((r) => r.map((c) => ({ ...c })));
            next[activeCell.row][activeCell.col].justWrong = false;
            return next;
          });
        }, 220);
        shakeTimers.current.set(key, timer);
        return;
      }

      advanceWithinWord(activeCell, effectiveDirection);
    },
    [activeCell, effectiveDirection, effectivePaused, puzzle, grid, advanceWithinWord]
  );

  const backspace = useCallback(() => {
    if (!activeCell) return;
    setGrid((g) => {
      const next = g.map((r) => r.map((c) => ({ ...c })));
      const cell = next[activeCell.row][activeCell.col];
      if (cell.status === "correct") return g;
      if (cell.value) {
        cell.value = "";
        cell.status = "empty";
        return next;
      }
      return g;
    });

    const prev =
      effectiveDirection === "across"
        ? { row: activeCell.row, col: activeCell.col - 1 }
        : { row: activeCell.row - 1, col: activeCell.col };
    if (puzzle.cells[prev.row]?.[prev.col] && !puzzle.cells[prev.row][prev.col].blocked) {
      setActiveCell(prev);
    }
  }, [activeCell, effectiveDirection, puzzle.cells]);

  const moveActive = useCallback(
    (dRow: number, dCol: number) => {
      if (!activeCell) return;
      let { row, col } = activeCell;
      for (let step = 0; step < Math.max(puzzle.width, puzzle.height); step++) {
        row += dRow;
        col += dCol;
        if (row < 0 || row >= puzzle.height || col < 0 || col >= puzzle.width) return;
        if (!puzzle.cells[row][col].blocked) {
          setActiveCell({ row, col });
          if (dRow !== 0) setActiveDirection("down");
          if (dCol !== 0) setActiveDirection("across");
          return;
        }
      }
    },
    [activeCell, puzzle.width, puzzle.height, puzzle.cells]
  );

  const useHint = useCallback(() => {
    if (!activeWord) return;
    const cells = cellsOfWord(activeWord);
    const target = cells.find((pos) => grid[pos.row][pos.col].status !== "correct");
    if (!target) return;
    const solution = letterAt(puzzle, target.row, target.col);
    if (!solution) return;

    setHintsUsed((n) => n + 1);
    setGrid((g) => {
      const next = g.map((r) => r.map((c) => ({ ...c })));
      next[target.row][target.col] = { value: solution, status: "correct", justWrong: false };
      return next;
    });
  }, [activeWord, grid, puzzle]);

  const state: CrosswordState = {
    grid,
    activeCell,
    activeDirection: effectiveDirection,
    activeWord,
    elapsedSeconds,
    hintsUsed,
    isComplete,
    accuracy,
    completedWordIds,
  };

  const actions: CrosswordActions = {
    selectCell,
    typeLetter,
    backspace,
    moveActive,
    toggleDirection,
    selectWord,
    useHint,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  };

  return { state, actions };
}
