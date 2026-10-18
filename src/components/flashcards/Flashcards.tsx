"use client";

import { useState, type FormEvent } from "react";
import { EXAMPLE_DECKS } from "@/lib/examples";
import { uid, useStored } from "@/lib/storage";
import type { Deck } from "@/lib/types";
import { Button, Card, ExampleBanner, Label, inputClass } from "../ui";
import { DeckView } from "./DeckView";
import { QuizMode } from "./QuizMode";
import { StudyMode } from "./StudyMode";

type View = { name: "list" } | { name: "deck" | "study" | "quiz"; deckId: string };

export function deckTitle(deck: Deck) {
  return deck.subject ? `${deck.subject} – ${deck.name}` : deck.name;
}

export function Flashcards() {
  const [decks, setDecks, isExample] = useStored<Deck[]>("studyhub:decks", EXAMPLE_DECKS);
  const [view, setView] = useState<View>({ name: "list" });
  const [creating, setCreating] = useState(false);

  const deck = view.name !== "list" ? decks.find((d) => d.id === view.deckId) : undefined;
  const updateDeck = (next: Deck) => setDecks((all) => all.map((d) => (d.id === next.id ? next : d)));

  if (deck && view.name === "study") {
    return <StudyMode deck={deck} onChange={updateDeck} onExit={() => setView({ name: "deck", deckId: deck.id })} />;
  }
  if (deck && view.name === "quiz") {
    return <QuizMode deck={deck} onExit={() => setView({ name: "deck", deckId: deck.id })} />;
  }
  if (deck && view.name === "deck") {
    return (
      <DeckView
        deck={deck}
        onChange={updateDeck}
        onBack={() => setView({ name: "list" })}
        onStudy={() => setView({ name: "study", deckId: deck.id })}
        onQuiz={() => setView({ name: "quiz", deckId: deck.id })}
        onDelete={() => {
          if (!confirm(`Delete "${deckTitle(deck)}" and all its cards?`)) return;
          setDecks(decks.filter((d) => d.id !== deck.id));
          setView({ name: "list" });
        }}
      />
    );
  }

  const bySubject = new Map<string, Deck[]>();
  for (const d of [...decks].sort((a, b) => b.createdAt - a.createdAt)) {
    const key = d.subject || "Other";
    bySubject.set(key, [...(bySubject.get(key) ?? []), d]);
  }

  return (
    <div className="space-y-6">
      {isExample && <ExampleBanner what="deck" onClear={() => setDecks([])} />}

      {creating ? (
        <NewDeckForm
          onCancel={() => setCreating(false)}
          onCreate={(subject, name) => {
            const created: Deck = { id: uid(), subject, name, cards: [], createdAt: Date.now() };
            setDecks([...(isExample ? [] : decks), created]);
            setCreating(false);
            setView({ name: "deck", deckId: created.id });
          }}
        />
      ) : (
        <Button onClick={() => setCreating(true)}>+ New deck</Button>
      )}

      {decks.length === 0 && !creating && (
        <Card className="text-center text-slate-600 dark:text-slate-400">
          No decks yet. Make one, then paste your class notes to fill it with cards.
        </Card>
      )}

      {[...bySubject.entries()].map(([subject, list]) => (
        <section key={subject}>
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400">{subject}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((d) => {
              const known = d.cards.filter((c) => c.box >= 2).length;
              const pct = d.cards.length ? Math.round((known / d.cards.length) * 100) : 0;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setView({ name: "deck", deckId: d.id })}
                  className="group rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-violet-300 focus-visible:outline-2 focus-visible:outline-violet-500 motion-reduce:hover:translate-y-0 sm:p-5 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-violet-700"
                >
                  <p className="text-lg font-bold group-hover:text-violet-700 dark:group-hover:text-violet-300">{d.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {d.cards.length} {d.cards.length === 1 ? "card" : "cards"} · {known} known
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function NewDeckForm({ onCreate, onCancel }: { onCreate: (subject: string, name: string) => void; onCancel: () => void }) {
  const [subject, setSubject] = useState("");
  const [name, setName] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(subject.trim(), name.trim());
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h3 className="text-lg font-bold">New deck</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="deck-subject">Subject</Label>
            <input id="deck-subject" className={inputClass} placeholder="e.g. Bio" value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus />
          </div>
          <div>
            <Label htmlFor="deck-name">Topic</Label>
            <input id="deck-name" className={inputClass} placeholder="e.g. Cell Division" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={!name.trim()}>
            Create deck
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
