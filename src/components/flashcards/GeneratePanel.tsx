"use client";

import { useState } from "react";
import { postJSON } from "@/lib/api";
import { EXAMPLE_NOTES } from "@/lib/examples";
import type { GeneratedCard } from "@/lib/schemas";
import { Button, Card, ErrorNote, Label, Spinner, inputClass } from "../ui";

const COUNTS = [5, 10, 15, 20];

export function GeneratePanel({
  onAdd,
  onClose,
}: {
  onAdd: (cards: GeneratedCard[]) => void;
  onClose?: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<(GeneratedCard & { keep: boolean })[] | null>(null);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const { cards } = await postJSON<{ cards: GeneratedCard[] }>("/api/flashcards", { notes, count });
      if (cards.length === 0) setError("Claude couldn't find anything to make cards from. Try pasting more detailed notes.");
      else setPreview(cards.map((c) => ({ ...c, keep: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (preview) {
    const kept = preview.filter((c) => c.keep);
    return (
      <Card className="space-y-4">
        <div>
          <h3 className="font-bold">Here are your cards</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Untick any you don&apos;t want. You can edit them later.</p>
        </div>
        <ul className="space-y-2">
          {preview.map((card, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 ring-1 ring-slate-200 hover:bg-slate-50 dark:ring-slate-800 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={card.keep}
                  onChange={() => setPreview(preview.map((c, j) => (j === i ? { ...c, keep: !c.keep } : c)))}
                  className="mt-1 size-4 shrink-0 accent-violet-600"
                />
                <span className={card.keep ? "" : "opacity-50"}>
                  <span className="block font-medium">{card.question}</span>
                  <span className="block text-sm text-slate-600 dark:text-slate-400">{card.answer}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onAdd(kept.map(({ question, answer }) => ({ question, answer })))} disabled={kept.length === 0}>
            Add {kept.length} {kept.length === 1 ? "card" : "cards"} to deck
          </Button>
          <Button variant="secondary" onClick={() => setPreview(null)}>
            Back to notes
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">✨ Make cards from your notes</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Paste your class notes and Claude writes question and answer cards.</p>
        </div>
        {onClose && (
          <Button variant="ghost" className="!px-2 !py-1" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        )}
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <Label htmlFor="notes">Your notes</Label>
          {!notes && (
            <button type="button" onClick={() => setNotes(EXAMPLE_NOTES)} className="mb-1.5 text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400">
              Try example notes
            </button>
          )}
        </div>
        <textarea
          id="notes"
          rows={8}
          className={inputClass}
          placeholder="Paste notes from class, a textbook summary, a study guide…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="count">How many cards</Label>
          <select id="count" className={`${inputClass} w-28`} value={count} onChange={(e) => setCount(Number(e.target.value))}>
            {COUNTS.map((n) => (
              <option key={n} value={n}>
                About {n}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={generate} disabled={loading || notes.trim().length < 20}>
          {loading ? (
            <>
              <Spinner /> Reading your notes…
            </>
          ) : (
            "Generate cards"
          )}
        </Button>
      </div>
      {error && <ErrorNote>{error}</ErrorNote>}
    </Card>
  );
}
