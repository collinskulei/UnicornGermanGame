"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

export function UsernameEditor({ username }: { username: string }) {
  const { updateUsername } = useAuth();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(username);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setValue(username);
    setError(null);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateUsername(value);
    setSaving(false);
    if (result.error) setError(result.error);
    else setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={startEditing}
        className="group flex items-center gap-2"
        aria-label="Edit username"
      >
        <h1 className="text-h1 text-unicorn-blue">{username}</h1>
        <span className="text-lg text-ink-soft opacity-0 transition group-hover:opacity-100">✏️</span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          maxLength={24}
          className="rounded-full border-2 border-unicorn-orange bg-cream px-4 py-1.5 font-display text-xl font-bold text-unicorn-blue outline-none"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-full bg-unicorn-orange px-4 py-1.5 font-display text-sm font-bold text-white shadow-card disabled:opacity-60"
        >
          {saving ? "..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-full bg-line px-4 py-1.5 font-display text-sm font-bold text-ink-soft"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-xs font-semibold text-error">{error}</p>}
    </div>
  );
}
