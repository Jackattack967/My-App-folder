"use client";

import { useMemo, useState } from "react";
import { daysBetween, formatDate, formatDay, todayISO } from "@/lib/dates";
import { exampleExams } from "@/lib/examples";
import { buildSchedule, type Session } from "@/lib/schedule";
import { useStored } from "@/lib/storage";
import type { Exam } from "@/lib/types";
import { Button, Card, ExampleBanner } from "../ui";
import { ExamForm } from "./ExamForm";

const COLORS = ["bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-teal-500"];

function colorFor(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

const CONFIDENCE_STYLE = [
  "",
  "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
];

const DAYS_SHOWN = 7;

export function ExamPlanner() {
  // Only rendered in the browser (after hydration). Fixed for the visit.
  const [today] = useState(todayISO);
  const examples = useMemo(() => exampleExams(today), [today]);
  const [exams, setExams, isExample] = useStored<Exam[]>("studyhub:exams", examples);
  const [editing, setEditing] = useState<Exam | "new" | null>(null);
  const [showAllDays, setShowAllDays] = useState(false);

  const upcoming = useMemo(
    () => exams.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    [exams, today],
  );
  const past = exams.filter((e) => e.date < today);
  const schedule = useMemo(() => buildSchedule(upcoming, today), [upcoming, today]);

  function save(exam: Exam) {
    if (exams.some((e) => e.id === exam.id)) {
      setExams(exams.map((e) => (e.id === exam.id ? exam : e)));
    } else {
      // Examples are cleared the moment the student adds a real exam.
      setExams([...(isExample ? [] : exams), exam]);
    }
    setEditing(null);
  }

  function remove(exam: Exam) {
    if (!confirm(`Delete the ${exam.subject} exam?`)) return;
    setExams(exams.filter((e) => e.id !== exam.id));
  }

  function toggle(session: Session) {
    setExams(
      exams.map((e) => {
        if (e.id !== session.examId) return e;
        const done = e.done.includes(session.key)
          ? e.done.filter((k) => k !== session.key)
          : [...e.done, session.key];
        return { ...e, done };
      }),
    );
  }

  const days = showAllDays ? schedule : schedule.slice(0, DAYS_SHOWN);

  return (
    <div className="space-y-6">
      {isExample && <ExampleBanner what="exams" onClear={() => setExams([])} />}

      {editing ? (
        <ExamForm
          key={editing === "new" ? "new" : editing.id}
          initial={editing === "new" ? undefined : editing}
          today={today}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <Button onClick={() => setEditing("new")}>+ Add exam</Button>
      )}

      {upcoming.length === 0 && !editing && (
        <Card className="text-center text-slate-600 dark:text-slate-400">
          No upcoming exams. Add one and you&apos;ll get a countdown and a study plan.
        </Card>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="exams-heading">
          <h2 id="exams-heading" className="mb-3 text-lg font-bold">
            Countdown
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                today={today}
                sessions={schedule.flatMap((d) => d.sessions.filter((s) => s.examId === exam.id))}
                onEdit={() => setEditing(exam)}
                onDelete={() => remove(exam)}
              />
            ))}
          </div>
        </section>
      )}

      {schedule.length > 0 && (
        <section aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="mb-3 text-lg font-bold">
            Your study plan
          </h2>
          <div className="space-y-3">
            {days.map((day) => (
              <Card key={day.date} className="!p-0">
                <h3
                  className={`px-4 pt-3 pb-1 text-sm font-semibold sm:px-5 ${
                    day.date === today ? "text-violet-700 dark:text-violet-300" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {formatDay(day.date, today)}
                  {daysBetween(today, day.date) <= 1 && ` · ${formatDate(day.date)}`}
                </h3>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {day.sessions.map((s) => {
                    const exam = upcoming.find((e) => e.id === s.examId)!;
                    const done = exam.done.includes(s.key);
                    return (
                      <li key={s.key}>
                        <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-slate-50 sm:px-5 dark:hover:bg-slate-800/50">
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => toggle(s)}
                            className="mt-0.5 size-5 shrink-0 accent-violet-600"
                          />
                          <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${colorFor(s.examId)}`} aria-hidden />
                          <span className={`min-w-0 flex-1 ${done ? "text-slate-400 line-through dark:text-slate-500" : ""}`}>
                            <span className="font-semibold">{s.subject}</span>
                            <span className="text-slate-400"> · </span>
                            {s.title}
                          </span>
                          <span className="shrink-0 text-sm text-slate-500 tabular-nums dark:text-slate-400">
                            {s.minutes} min
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ))}
          </div>
          {schedule.length > DAYS_SHOWN && (
            <Button variant="ghost" className="mt-3" onClick={() => setShowAllDays((v) => !v)}>
              {showAllDays ? "Show less" : `Show all ${schedule.length} days`}
            </Button>
          )}
        </section>
      )}

      {past.length > 0 && (
        <section aria-labelledby="past-heading">
          <h2 id="past-heading" className="mb-3 text-lg font-bold text-slate-500 dark:text-slate-400">
            Past exams
          </h2>
          <ul className="space-y-2">
            {past.map((exam) => (
              <li key={exam.id} className="flex items-center justify-between rounded-xl px-4 py-2 ring-1 ring-slate-200 dark:ring-slate-800">
                <span>
                  {exam.subject} <span className="text-slate-500">· {formatDate(exam.date)}</span>
                </span>
                <Button variant="danger" className="!px-2 !py-1" onClick={() => remove(exam)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function ExamCard({
  exam,
  today,
  sessions,
  onEdit,
  onDelete,
}: {
  exam: Exam;
  today: string;
  sessions: Session[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const days = daysBetween(today, exam.date);
  const urgency =
    days <= 3 ? "text-rose-600 dark:text-rose-400" : days <= 7 ? "text-amber-600 dark:text-amber-400" : "text-violet-600 dark:text-violet-400";
  const left = sessions.filter((s) => !exam.done.includes(s.key)).length;
  const doneCount = exam.done.length;
  const pct = doneCount + left === 0 ? 0 : Math.round((doneCount / (doneCount + left)) * 100);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`size-2.5 shrink-0 rounded-full ${colorFor(exam.id)}`} aria-hidden />
            <h3 className="truncate text-lg font-bold">{exam.subject}</h3>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(exam.date)}</p>
        </div>
        <div className={`text-right ${urgency}`}>
          {days === 0 ? (
            <p className="text-xl font-extrabold">Today!</p>
          ) : (
            <>
              <p className="text-3xl leading-none font-extrabold tabular-nums">{days}</p>
              <p className="text-xs font-semibold">{days === 1 ? "day to go" : "days to go"}</p>
            </>
          )}
        </div>
      </div>

      {exam.topics.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
          {exam.topics.map((t) => (
            <li key={t.id} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CONFIDENCE_STYLE[t.confidence]}`}>
              {t.name} <span className="opacity-70">· {t.confidence}/5</span>
            </li>
          ))}
        </ul>
      )}

      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{doneCount} {doneCount === 1 ? "session" : "sessions"} done</span>
          <span>{left} to go</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${exam.subject} study progress`}>
          <div className={`h-full rounded-full ${colorFor(exam.id)}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-1">
        <Button variant="ghost" className="!px-2 !py-1" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="danger" className="!px-2 !py-1" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
}
