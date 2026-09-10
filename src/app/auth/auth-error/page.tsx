import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-6xl">🦄💫</div>
      <h1 className="text-h1">Whoops, that link didn&apos;t work</h1>
      <p className="max-w-sm text-ink-soft">
        Magic links expire after a while, or can only be used once. Head back and send yourself a
        fresh one — your progress is safe.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-unicorn-orange px-6 py-3 font-display text-lg font-bold text-white shadow-float transition hover:bg-unicorn-orange-dark"
      >
        Back to Home
      </Link>
    </main>
  );
}
