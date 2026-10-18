"use client";

import { useState, type FormEvent } from "react";
import { uid } from "@/lib/storage";
import type { Card as FlashCard, Deck } from "@/lib/types";
import { Button, Card, Label, inputClass } from "../ui";
import { GeneratePanel } from "./GeneratePanel";
import { MIN_QUIZ_CARDS, canQuiz } from "./QuizMode";

export function DeckView({
  deck,
  onChange,
  onBack,
  onStudy,
  onQuiz,
  onDelete,
}: {
  deck: Deck;
  onChange: (deck: Deck) => void;
  onBack: () => void;
  onStudy: () => void;
  onQuiz: () => void;
  onDelete: () => void;
}) {
  const [showGenerate, setShowGenerate] = useState(deck.cards.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const known = deck.cards.filter((c) => c.box >= 2).length;
  const quizReady = canQuiz(deck);

  const addCards = (cards: { question: string; answer: string }[]) =>
    onChange({ ...deck, cards: [...deck.cards, ...cards.map((c) => ({ ...c, id: uid(), box: 0 }))] });
  const updateCard = (card: FlashCard) =>
    onChange({ ...deck, cards: deck.cards.map((c) => (c.id === card.id ? card : c)) });
  const removeCard = (id: string) => onChange({ ...deck, cards: deck.cards.filter((c) => c.id !== id) });

  return (
    <div className="space-y-5">
      <Button variant="ghost" className="-ml-2 !px-2" onClick={onBack}>
        ← All decks
      </Button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {deck.subject && <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">{deck.subject}</p>}
          <h2 className="text-2xl font-bold tracking-tight">{deck.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {deck.cards.length} cards · {known} known
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onStudy} disabled={deck.cards.length === 0}>
            Study
          </Button>
          <Button
            variant="secondary"
            onClick={onQuiz}
            disabled={!quizReady}
            title={quizReady ? undefined : `Quiz needs at least ${MIN_QUIZ_CARDS} cards with different answers`}
          >
            Quiz
          </Button>
        </div>
      </div>

      {showGenerate ? (
        <GeneratePanel onAdd={(cards) => { addCards(cards); setShowGenerate(false); }} onClose={deck.cards.length ? () => setShowGenerate(false) : undefined} />
      ) : (
        <Button variant="secondary" onClick={() => setShowGenerate(true)}>
          ✨ Make cards from notes
        </Button>
      )}

      <AddCardForm onAdd={(q, a) => addCards([{ question: q, answer: a }])} />

      {deck.cards.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Cards</h3>
          <ul className="space-y-2">
            {deck.cards.map((card) =>
              editingId === card.id ? (
                <li key={card.id}>
                  <EditCard
                    card={card}
                    onSave={(c) => {
                      updateCard(c);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </li>
              ) : (
                <li
                  key={card.id}
                  className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{card.question}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{card.answer}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" className="!px-2 !py-1" onClick={() => setEditingId(card.id)} aria-label={`Edit card: ${card.question}`}>
                      Edit
                    </Button>
                    <Button variant="danger" className="!px-2 !py-1" onClick={() => removeCard(card.id)} aria-label={`Delete card: ${card.question}`}>
                      ✕
                    </Button>
                  </div>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <Button variant="danger" onClick={onDelete}>
          Delete deck
        </Button>
      </div>
    </div>
  );
}

function AddCardForm({ onAdd }: { onAdd: (question: string, answer: string) => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    onAdd(question.trim(), answer.trim());
    setQuestion("");
    setAnswer("");
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-3">
        <h3 className="font-bold">Add a card yourself</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="new-q">Question</Label>
            <input id="new-q" className={inputClass} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What is osmosis?" />
          </div>
          <div>
            <Label htmlFor="new-a">Answer</Label>
            <input id="new-a" className={inputClass} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Water moving across a membrane…" />
          </div>
        </div>
        <Button type="submit" variant="secondary" disabled={!question.trim() || !answer.trim()}>
          Add card
        </Button>
      </form>
    </Card>
  );
}

function EditCard({ card, onSave, onCancel }: { card: FlashCard; onSave: (card: FlashCard) => void; onCancel: () => void }) {
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);
  return (
    <Card className="space-y-3">
      <div>
        <Label htmlFor={`q-${card.id}`}>Question</Label>
        <textarea id={`q-${card.id}`} rows={2} className={inputClass} value={question} onChange={(e) => setQuestion(e.target.value)} />
      </div>
      <div>
        <Label htmlFor={`a-${card.id}`}>Answer</Label>
        <textarea id={`a-${card.id}`} rows={2} className={inputClass} value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSave({ ...card, question: question.trim(), answer: answer.trim() })} disabled={!question.trim() || !answer.trim()}>
          Save
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}
