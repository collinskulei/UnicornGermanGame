"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const { sendMagicLink } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!EMAIL_RE.test(email.trim())) {
      setError("That doesn't look like a valid email address.");
      return;
    }

    setSubmitting(true);
    const result = await sendMagicLink(email);
    setSubmitting(false);

    if (result.status === "error") setError(result.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="flex max-w-sm flex-col items-center gap-2 rounded-2xl bg-cloud p-6 text-center shadow-card">
        <span className="text-3xl">📬</span>
        <p className="font-display font-bold text-unicorn-blue">Check your email!</p>
        <p className="text-sm text-ink-soft">
          We sent a magic link to <strong>{email}</strong>. Open it on this device to sign in —
          no password needed.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-3 rounded-2xl bg-cloud p-6 shadow-card"
    >
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-full border-2 border-line bg-cream px-4 py-2.5 text-ink outline-none focus:border-unicorn-orange"
        />
        <p className="px-1 text-xs text-ink-soft">
          No password to remember — we&apos;ll email you a magic link to sign in.
        </p>
      </div>

      {error && <p className="rounded-lg bg-error/10 px-3 py-2 text-sm font-semibold text-error">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 rounded-full bg-unicorn-orange px-6 py-3 font-display text-lg font-bold text-white shadow-float transition hover:-translate-y-0.5 hover:bg-unicorn-orange-dark disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {submitting ? "Sending..." : "Send Magic Link"}
      </button>
    </form>
  );
}
