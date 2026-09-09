import { redirect } from "next/navigation";

// The crossword game is hidden for now (see ../page.tsx) — direct links
// to a tier's puzzle list bounce back to the placeholder instead of
// showing the picker. The original picker UI is preserved in git history.
export default function TierPuzzleListPage() {
  redirect("/play");
}
