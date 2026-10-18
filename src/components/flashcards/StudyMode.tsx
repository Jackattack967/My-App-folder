"use client";

import { useCallback, useEffect, useState } from "react";
import { shuffle } from "@/lib/random";
import type { Deck } from "@/lib/types";
import { Button, Card } from "../ui";

/** A card marked "again" comes back after this many other cards. */
const AGAIN_GAP = 3;

/** Weakest cards (lowest box) first, shuffled within each box. */
function initialQueue(deck: Deck) {
  return shuffle(deck.cards)
    .sort((a, b) => a.box - b.box)
    .map((c) => c.id);
}

export function StudyMode({ deck, onChange, onExit }: { deck: Deck; onChange: (deck: Deck) => void; onExit: () => void }) {
  const [queue, setQueue] = useState(() => initialQueue(deck));
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<string[]>([]);
  const [gotFirstTry, setGotFirstTry] = useState(0);

  const card = deck.cards.find((c) => c.id === queue[0]);

  const answer = useCallback(
    (gotIt: boolean) => {
      if (!card) return;
      const [, ...rest] = queue;
      if (gotIt) {
        if (!missed.includes(card.id)) setGotFirstTry((n) => n + 1);
        setQueue(rest);
      } else {
        if (!missed.includes(card.id)) setMissed([...missed, card.id]);
        const at = Math.min(AGAIN_GAP, rest.length);
        setQueue([...rest.slice(0, at), card.id, ...rest.slice(at)]);
      }
      const box = gotIt ? Math.min(card.box + 1, 5) : 0;
      onChange({ ...deck, cards: deck.cards.map((c) => (c.id === card.id ? { ...c, box } : c)) });
      setFlipped(false);
    },
    [card, deck, missed, onChange, queue],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea, select")) return;
      if (e.key === " " || e.key === "Enter") {
        if (e.target instanceof HTMLButtonElement) return;
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "1") answer(false);
      else if (flipped && e.key === "2") answer(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, flipped]);

  const header = (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" className="-ml-2 !px-2" onClick={onExit}>
        ← {deck.name}
      </Button>
      {card && (
        <span className="text-sm text-slate-500 tabular-nums dark:text-slate-400">
          {queue.length} left
        </span>
      )}
    </div>
  );

  if (!card) {
    return (
      <div className="space-y-5">
        {header}
        <Card className="space-y-4 py-10 text-center">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <h2 className="text-2xl font-bold">Round complete!</h2>
          <p className="text-slate-600 dark:text-slate-400">
            {gotFirstTry} of {deck.cards.length} first try
            {missed.length > 0 && `, ${missed.length} needed another go`}.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => {
                setQueue(initialQueue(deck));
                setMissed([]);
                setGotFirstTry(0);
              }}
            >
              Study again
            </Button>
            <Button variant="secondary" onClick={onExit}>
              Done
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {header}
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? `Answer: ${card.answer}. Tap to see the question.` : `Question: ${card.question}. Tap to see the answer.`}
        className="flip block h-72 w-full rounded-3xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-500 sm:h-80"
      >
        <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
          <div className="flip-face flex flex-col rounded-3xl bg-white p-6 shadow-md ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <span className="text-xs font-semibold tracking-wide text-violet-600 dark:text-violet-400">QUESTION</span>
            <p className="m-auto text-center text-xl font-semibold sm:text-2xl">{card.question}</p>
            <span className="text-center text-xs text-slate-400">Tap or press space to flip</span>
          </div>
          <div className="flip-face flip-back flex flex-col rounded-3xl bg-violet-600 p-6 text-white shadow-md">
            <span className="text-xs font-semibold tracking-wide text-violet-200">ANSWER</span>
            <p className="m-auto text-center text-xl font-semibold sm:text-2xl">{card.answer}</p>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          className="!py-3.5 text-base !text-rose-600 dark:!text-rose-400"
          disabled={!flipped}
          onClick={() => answer(false)}
        >
          Again <kbd className="hidden text-xs opacity-60 sm:inline">1</kbd>
        </Button>
        <Button className="!bg-emerald-600 !py-3.5 text-base hover:!bg-emerald-700 disabled:!bg-emerald-300 dark:disabled:!bg-emerald-950" disabled={!flipped} onClick={() => answer(true)}>
          Got it <kbd className="hidden text-xs opacity-60 sm:inline">2</kbd>
        </Button>
      </div>
      {!flipped && <p className="text-center text-sm text-slate-500 dark:text-slate-400">Think of the answer, then flip the card.</p>}
    </div>
  );
}
