import { redirect } from "next/navigation";

// The crossword game is hidden for now (see ../../page.tsx) — direct
// links to a specific puzzle bounce back to the placeholder instead of
// loading the game. The original game screen is preserved in git history.
export default function PuzzleGamePage() {
  redirect("/play");
}
