"use client";

import { useState } from "react";
import { GuideTour } from "@/components/guide/GuideTour";

export function GuideMeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full bg-unicorn-orange-light px-3 py-1.5 font-display text-sm font-bold text-unicorn-blue shadow-card transition hover:brightness-95"
      >
        <span>🦄</span>
        <span className="hidden sm:inline">Guide me</span>
      </button>
      {open && <GuideTour onClose={() => setOpen(false)} />}
    </>
  );
}
