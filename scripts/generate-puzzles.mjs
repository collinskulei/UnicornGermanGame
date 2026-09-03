#!/usr/bin/env node
/**
 * Reads content/vocab-source.json (flat {answer, clue} lists, no layout)
 * and algorithmically places each puzzle's words onto a grid, producing
 * content/puzzles.json — the fully laid-out data the app consumes
 * (src/data/puzzles.ts re-exports this, typed).
 *
 * This is a "criss-cross" style generator: words interlock at shared
 * letters; cells not part of any word are blocked. It guarantees:
 *   - every overlap is a real letter match
 *   - no two words run together accidentally (adjacency guard)
 *   - deterministic output (seeded PRNG per puzzle id)
 *
 * Usage: node scripts/generate-puzzles.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const CANVAS = 31; // oversized square canvas, trimmed to bounding box after placement
const CENTER = Math.floor(CANVAS / 2);
const ATTEMPTS_PER_PUZZLE = 40;

// --- seeded PRNG (mulberry32) for deterministic, repeatable layouts ---
function seedFromString(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seededShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- grid primitives ---
function makeGrid() {
  return Array.from({ length: CANVAS }, () =>
    Array.from({ length: CANVAS }, () => null) // null = empty; else { letter, acrossId, downId }
  );
}

function inBounds(r, c) {
  return r >= 0 && r < CANVAS && c >= 0 && c < CANVAS;
}

function wordCells(word, row, col, dir) {
  const cells = [];
  for (let i = 0; i < word.length; i++) {
    cells.push(dir === "across" ? [row, col + i] : [row + i, col]);
  }
  return cells;
}

function canPlace(grid, word, row, col, dir) {
  const cells = wordCells(word, row, col, dir);
  // before-start / after-end must be empty (words can't run together)
  const [br, bc] = dir === "across" ? [row, col - 1] : [row - 1, col];
  const [ar, ac] = dir === "across" ? [row, col + word.length] : [row + word.length, col];
  if (inBounds(br, bc) && grid[br][bc]) return false;
  if (inBounds(ar, ac) && grid[ar][ac]) return false;

  let intersections = 0;

  for (let i = 0; i < cells.length; i++) {
    const [r, c] = cells[i];
    if (!inBounds(r, c)) return false;
    const existing = grid[r][c];
    const letter = word[i];

    if (existing) {
      if (existing.letter !== letter) return false;
      // must be a real crossing: the occupying word must run the OTHER direction
      const crossingDir = dir === "across" ? "downId" : "acrossId";
      if (!existing[crossingDir]) return false;
      // this direction must not already be occupied at this cell
      const sameDir = dir === "across" ? "acrossId" : "downId";
      if (existing[sameDir]) return false;
      intersections++;
    } else {
      // empty cell: perpendicular neighbors must also be empty, else this
      // letter would silently touch an unrelated word (ambiguous adjacency)
      const [pr1, pc1] = dir === "across" ? [r - 1, c] : [r, c - 1];
      const [pr2, pc2] = dir === "across" ? [r + 1, c] : [r, c + 1];
      if (inBounds(pr1, pc1) && grid[pr1][pc1]) return false;
      if (inBounds(pr2, pc2) && grid[pr2][pc2]) return false;
    }
  }

  return { intersections };
}

function place(grid, word, row, col, dir, wordId) {
  const cells = wordCells(word, row, col, dir);
  for (let i = 0; i < cells.length; i++) {
    const [r, c] = cells[i];
    const letter = word[i];
    const existing = grid[r][c] ?? { letter, acrossId: null, downId: null };
    existing.letter = letter;
    if (dir === "across") existing.acrossId = wordId;
    else existing.downId = wordId;
    grid[r][c] = existing;
  }
}

function findBestPlacement(grid, word, placedSoFar) {
  let best = null;
  for (const other of placedSoFar) {
    for (let oi = 0; oi < other.answer.length; oi++) {
      const oc = other.answer[oi];
      for (let wi = 0; wi < word.length; wi++) {
        if (word[wi] !== oc) continue;
        const dir = other.direction === "across" ? "down" : "across";
        let row, col;
        if (other.direction === "across") {
          row = other.row - wi;
          col = other.col + oi;
        } else {
          row = other.row + oi;
          col = other.col - wi;
        }
        const result = canPlace(grid, word, row, col, dir);
        if (result && (!best || result.intersections > best.intersections)) {
          best = { row, col, dir, intersections: result.intersections };
        }
      }
    }
  }
  return best;
}

// Used only when a word shares no usable letter with anything placed so
// far (rare, but possible with short/unusual word sets) — drops it onto
// the canvas as its own disconnected cluster rather than failing the
// whole puzzle. Layouts that need this are still valid, just scored
// worse so more-connected attempts win when available.
function findFallbackPlacement(grid, word) {
  for (let r = 0; r < CANVAS; r++) {
    for (let c = 0; c <= CANVAS - word.length; c++) {
      if (canPlace(grid, word, r, c, "across")) return { row: r, col: c, dir: "across" };
    }
  }
  for (let r = 0; r <= CANVAS - word.length; r++) {
    for (let c = 0; c < CANVAS; c++) {
      if (canPlace(grid, word, r, c, "down")) return { row: r, col: c, dir: "down" };
    }
  }
  return null;
}

function attemptLayout(words, rng) {
  const grid = makeGrid();
  const order = seededShuffle(words, rng).sort((a, b) => b.answer.length - a.answer.length);
  const placed = [];
  let fallbackCount = 0;

  // seed with the longest word, centered horizontally
  const first = order[0];
  const startCol = CENTER - Math.floor(first.answer.length / 2);
  place(grid, first.answer, CENTER, startCol, "across", first.answer + "#0");
  placed.push({ ...first, row: CENTER, col: startCol, direction: "across" });

  for (let idx = 1; idx < order.length; idx++) {
    const w = order[idx];
    let spot = findBestPlacement(grid, w.answer, placed);
    if (!spot) {
      spot = findFallbackPlacement(grid, w.answer);
      if (!spot) return null; // truly no room left; caller retries a different order
      fallbackCount++;
    }
    place(grid, w.answer, spot.row, spot.col, spot.dir, w.answer + "#" + idx);
    placed.push({ ...w, row: spot.row, col: spot.col, direction: spot.dir });
  }

  // bounding box
  let minR = CANVAS, maxR = -1, minC = CANVAS, maxC = -1;
  for (let r = 0; r < CANVAS; r++) {
    for (let c = 0; c < CANVAS; c++) {
      if (grid[r][c]) {
        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);
      }
    }
  }

  const width = maxC - minC + 1;
  const height = maxR - minR + 1;
  const area = width * height;

  return { grid, placed, minR, minC, width, height, area, fallbackCount };
}

function buildPuzzle(tier, puzzleSrc) {
  const rng = mulberry32(seedFromString(puzzleSrc.id));
  let best = null;

  for (let attempt = 0; attempt < ATTEMPTS_PER_PUZZLE; attempt++) {
    const layout = attemptLayout(puzzleSrc.words, rng);
    if (
      layout &&
      (!best ||
        layout.fallbackCount < best.fallbackCount ||
        (layout.fallbackCount === best.fallbackCount && layout.area < best.area))
    ) {
      best = layout;
    }
  }

  if (!best) {
    throw new Error(
      `Could not generate any layout for puzzle "${puzzleSrc.id}" after ${ATTEMPTS_PER_PUZZLE} attempts.`
    );
  }
  if (best.fallbackCount > 0) {
    console.warn(
      `  ⚠ ${puzzleSrc.id}: ${best.fallbackCount} word(s) placed as disconnected clusters (low letter overlap).`
    );
  }

  const { grid, placed, minR, minC, width, height } = best;

  // build trimmed cells grid
  const cells = Array.from({ length: height }, (_, r) =>
    Array.from({ length: width }, (_, c) => {
      const src = grid[minR + r][minC + c];
      if (!src) return { row: r, col: c, blocked: true };
      return { row: r, col: c, blocked: false, solution: src.letter };
    })
  );

  // re-index placed words to trimmed coordinates
  const relocated = placed.map((w) => ({
    ...w,
    row: w.row - minR,
    col: w.col - minC,
  }));

  // assign clue numbers: a cell numbers if it starts an across and/or down
  // word, scanning the grid in reading order (not word list order).
  const numberAt = new Map();
  const uniqueSorted = [...new Set(relocated.map((w) => `${w.row},${w.col}`))].sort((a, b) => {
    const [ar, ac] = a.split(",").map(Number);
    const [br, bc] = b.split(",").map(Number);
    return ar - br || ac - bc;
  });
  uniqueSorted.forEach((key, i) => numberAt.set(key, i + 1));

  const words = relocated.map((w) => {
    const key = `${w.row},${w.col}`;
    const number = numberAt.get(key);
    return {
      id: `${number}-${w.direction}`,
      number,
      answer: w.answer,
      clue: w.clue,
      direction: w.direction,
      row: w.row,
      col: w.col,
    };
  });

  for (const w of words) {
    cells[w.row][w.col].number = w.number;
  }

  return {
    id: puzzleSrc.id,
    tier,
    theme: puzzleSrc.theme,
    width,
    height,
    cells,
    words,
  };
}

function main() {
  const sourcePath = join(ROOT, "content", "vocab-source.json");
  const source = JSON.parse(readFileSync(sourcePath, "utf-8"));

  const output = { levels: [] };
  let totalPuzzles = 0;

  for (const level of source.levels) {
    const puzzles = level.puzzles.map((p) => buildPuzzle(level.id, p));
    output.levels.push({ id: level.id, puzzles });
    totalPuzzles += puzzles.length;
    console.log(`✓ ${level.id}: ${puzzles.length} puzzles generated`);
  }

  const outDir = join(ROOT, "content");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "puzzles.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");

  const dataDir = join(ROOT, "src", "data");
  mkdirSync(dataDir, { recursive: true });
  const tsPath = join(dataDir, "puzzles.ts");
  writeFileSync(
    tsPath,
    `// AUTO-GENERATED by scripts/generate-puzzles.mjs — do not edit by hand.\n` +
      `// Re-run \`npm run generate:puzzles\` after editing content/vocab-source.json.\n` +
      `import type { Puzzle, TierId } from "@/types";\n\n` +
      `export interface TierPuzzles {\n  id: TierId;\n  puzzles: Puzzle[];\n}\n\n` +
      `export const PUZZLE_LEVELS: TierPuzzles[] = ${JSON.stringify(output.levels, null, 2)};\n\n` +
      `export function getPuzzle(tier: TierId, puzzleId: string): Puzzle | undefined {\n` +
      `  return PUZZLE_LEVELS.find((l) => l.id === tier)?.puzzles.find((p) => p.id === puzzleId);\n` +
      `}\n\n` +
      `export function getPuzzlesForTier(tier: TierId): Puzzle[] {\n` +
      `  return PUZZLE_LEVELS.find((l) => l.id === tier)?.puzzles ?? [];\n` +
      `}\n`,
    "utf-8"
  );

  console.log(`\nDone. ${totalPuzzles} puzzles written to:`);
  console.log(`  - ${outPath}`);
  console.log(`  - ${tsPath}`);
}

main();
