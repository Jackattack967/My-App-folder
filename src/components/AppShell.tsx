"use client";

import type { ReactNode } from "react";
import { useHydrated, useStored } from "@/lib/storage";
import { ThemeToggle } from "./ThemeToggle";
import { Flashcards } from "./flashcards/Flashcards";
import { ExamPlanner } from "./planner/ExamPlanner";
import { EssayHelper } from "./essay/EssayHelper";

type Tab = "flashcards" | "planner" | "essay";

const TABS: { id: Tab; label: string; blurb: string; icon: ReactNode }[] = [
  {
    id: "flashcards",
    label: "Flashcards",
    blurb: "Paste your notes, get flashcards, then study or quiz yourself.",
    icon: (
      <path d="M4 7a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM17 8l2 .5a2 2 0 0 1 1.4 2.4L18.5 18" />
    ),
  },
  {
    id: "planner",
    label: "Exams",
    blurb: "Count down to your exams with a day-by-day plan that gives weak topics more time.",
    icon: <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 14l2 2 4-4" />,
  },
  {
    id: "essay",
    label: "Essays",
    blurb: "Turn an essay prompt into a thesis and a plan. You do the writing.",
    icon: <path d="M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h5" />,
  },
];

export function AppShell() {
  const [tab, setTab] = useStored<Tab>("studyhub:tab", "flashcards");
  const hydrated = useHydrated();
  const active = TABS.find((t) => t.id === tab) ?? TABS[0];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between gap-3 py-4 sm:py-6">
        <div className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 8l10-5 10 5-10 5zM6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">Study Hub</span>
        </div>
        <ThemeToggle />
      </header>

      <nav
        aria-label="Tools"
        className="sticky top-0 z-10 -mx-4 bg-slate-50/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 dark:bg-slate-950/90"
      >
        <div role="tablist" className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1 dark:bg-slate-800/70">
          {TABS.map((t) => {
            const selected = t.id === active.id;
            return (
              <button
                key={t.id}
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={selected}
                aria-controls="tool-panel"
                onClick={() => setTab(t.id)}
                className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-violet-500 ${
                  selected
                    ? "bg-white text-violet-700 shadow-sm dark:bg-violet-600 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
              >
                <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {t.icon}
                </svg>
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main id="tool-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} className="mt-4 flex-1">
        <p className="mb-5 text-slate-600 dark:text-slate-400">{active.blurb}</p>
        {!hydrated ? (
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60 motion-reduce:animate-none dark:bg-slate-800/60" />
        ) : active.id === "flashcards" ? (
          <Flashcards />
        ) : active.id === "planner" ? (
          <ExamPlanner />
        ) : (
          <EssayHelper />
        )}
      </main>
    </div>
  );
}
