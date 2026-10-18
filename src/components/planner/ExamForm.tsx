"use client";

import { useState, type FormEvent } from "react";
import { uid } from "@/lib/storage";
import type { Exam, Topic } from "@/lib/types";
import { Button, Card, ErrorNote, Label, inputClass } from "../ui";

const CONFIDENCE_HINT = ["", "Lost", "Shaky", "Okay", "Good", "Got this"];

export function ExamForm({
  initial,
  today,
  onSave,
  onCancel,
}: {
  initial?: Exam;
  today: string;
  onSave: (exam: Exam) => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState(initial?.subject ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [topics, setTopics] = useState<Topic[]>(
    initial?.topics.length ? initial.topics : [{ id: uid(), name: "", confidence: 3 }],
  );
  const [error, setError] = useState("");

  const updateTopic = (id: string, patch: Partial<Topic>) =>
    setTopics((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!subject.trim()) return setError("Give the exam a subject.");
    if (!date) return setError("Pick the exam date.");
    if (date < today) return setError("That date has already passed.");
    onSave({
      id: initial?.id ?? uid(),
      subject: subject.trim(),
      date,
      topics: topics.filter((t) => t.name.trim()).map((t) => ({ ...t, name: t.name.trim() })),
      done: initial?.done ?? [],
    });
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <h3 className="text-lg font-bold">{initial ? "Edit exam" : "Add an exam"}</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="exam-subject">Subject</Label>
            <input
              id="exam-subject"
              className={inputClass}
              placeholder="e.g. Chemistry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="exam-date">Date</Label>
            <input
              id="exam-date"
              type="date"
              className={inputClass}
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Topics and how confident you feel (1 = lost, 5 = got this)
          </legend>
          <ul className="space-y-2">
            {topics.map((topic, i) => (
              <li key={topic.id} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <input
                  aria-label={`Topic ${i + 1}`}
                  className={`${inputClass} min-w-0 flex-1 basis-full sm:basis-auto`}
                  placeholder="e.g. Stoichiometry"
                  value={topic.name}
                  onChange={(e) => updateTopic(topic.id, { name: e.target.value })}
                />
                <div role="radiogroup" aria-label={`Confidence for topic ${i + 1}`} className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={topic.confidence === n}
                      aria-label={`${n}: ${CONFIDENCE_HINT[n]}`}
                      title={CONFIDENCE_HINT[n]}
                      onClick={() => updateTopic(topic.id, { confidence: n })}
                      className={`size-10 rounded-lg text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-violet-500 ${
                        topic.confidence === n
                          ? "bg-violet-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setTopics((list) => list.filter((t) => t.id !== topic.id))}
                  aria-label={`Remove topic ${i + 1}`}
                  className="grid size-10 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-violet-500 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <Button
            variant="ghost"
            className="mt-2 px-2"
            onClick={() => setTopics((list) => [...list, { id: uid(), name: "", confidence: 3 }])}
          >
            + Add topic
          </Button>
        </fieldset>

        {error && <ErrorNote>{error}</ErrorNote>}

        <div className="flex gap-2">
          <Button type="submit">{initial ? "Save changes" : "Add exam"}</Button>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
