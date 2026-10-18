"use client";

import { useState } from "react";
import { shuffle } from "@/lib/random";
import type { Card as FlashCard, Deck } from "@/lib/types";
import { Button, Card } from "../ui";

export const MIN_QUIZ_CARDS = 4;
const MAX_QUESTIONS = 10;

type Question = { card: FlashCard; options: string[] };

function distinctAnswers(deck: Deck) {
  return [...new Set(deck.cards.map((c) => c.answer))];
}

export function canQuiz(deck: Deck) {
  return distinctAnswers(deck).length >= MIN_QUIZ_CARDS;
}

function buildQuiz(deck: Deck): Question[] {
  const answers = distinctAnswers(deck);
  return shuffle(deck.cards)
    .slice(0, MAX_QUESTIONS)
    .map((card) => ({
      card,
      options: shuffle([card.answer, ...shuffle(answers.filter((a) => a !== card.answer)).slice(0, 3)]),
    }));
}

export function QuizMode({ deck, onExit }: { deck: Deck; onExit: () => void }) {
  const [questions, setQuestions] = useState(() => buildQuiz(deck));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [missed, setMissed] = useState<Question[]>([]);

  const restart = () => {
    setQuestions(buildQuiz(deck));
    setIndex(0);
    setPicked(null);
    setMissed([]);
  };

  const back = (
    <Button variant="ghost" className="-ml-2 !px-2" onClick={onExit}>
      ← {deck.name}
    </Button>
  );

  if (index >= questions.length) {
    const score = questions.length - missed.length;
    const pct = Math.round((score / questions.length) * 100);
    const message = pct === 100 ? "Perfect score! 🏆" : pct >= 80 ? "Great job! 🎉" : pct >= 50 ? "Getting there! 💪" : "Keep studying, you'll get it 📚";
    return (
      <div className="space-y-5">
        {back}
        <Card className="space-y-2 py-8 text-center">
          <p className="text-5xl font-extrabold text-violet-600 tabular-nums dark:text-violet-400">
            {score}/{questions.length}
          </p>
          <p className="text-xl font-bold">{message}</p>
          <p className="text-slate-500 dark:text-slate-400">{pct}% correct</p>
        </Card>
        {missed.length > 0 && (
          <section>
            <h3 className="mb-2 font-bold">Review these</h3>
            <ul className="space-y-2">
              {missed.map((q) => (
                <li key={q.card.id} className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                  <p className="font-medium">{q.card.question}</p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">{q.card.answer}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex gap-2">
          <Button onClick={restart}>New quiz</Button>
          <Button variant="secondary" onClick={onExit}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  const q = questions[index];

  function pick(option: string) {
    if (picked) return;
    setPicked(option);
    if (option !== q.card.answer) setMissed([...missed, q]);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        {back}
        <span className="text-sm text-slate-500 tabular-nums dark:text-slate-400">
          {index + 1} / {questions.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${(index / questions.length) * 100}%` }} />
      </div>

      <Card className="py-8">
        <p className="text-center text-xl font-semibold sm:text-2xl">{q.card.question}</p>
      </Card>

      <ul className="grid gap-2 sm:grid-cols-2">
        {q.options.map((option, i) => {
          const isAnswer = option === q.card.answer;
          const state = !picked
            ? "bg-white ring-slate-200 hover:ring-violet-400 dark:bg-slate-900 dark:ring-slate-700 dark:hover:ring-violet-500"
            : isAnswer
              ? "bg-emerald-50 ring-emerald-500 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
              : option === picked
                ? "bg-rose-50 ring-rose-500 text-rose-900 dark:bg-rose-950 dark:text-rose-100"
                : "bg-white ring-slate-200 opacity-60 dark:bg-slate-900 dark:ring-slate-800";
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => pick(option)}
                disabled={!!picked}
                className={`flex h-full w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left ring-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 ${state}`}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
                {picked && isAnswer && <span className="ml-auto" aria-label="Correct answer">✓</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {picked && (
        <div className="flex items-center justify-between gap-3">
          <p role="status" className={`font-semibold ${picked === q.card.answer ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {picked === q.card.answer ? "Correct!" : "Not quite."}
          </p>
          <Button
            autoFocus
            onClick={() => {
              setIndex(index + 1);
              setPicked(null);
            }}
          >
            {index + 1 === questions.length ? "See score" : "Next"}
          </Button>
        </div>
      )}
    </div>
  );
}
