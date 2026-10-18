import { addDays, daysBetween } from "./dates";
import type { Exam, Topic } from "./types";

export type Session = {
  key: string;
  examId: string;
  subject: string;
  date: string;
  title: string;
  minutes: number;
  kind: "study" | "review" | "exam-day";
};

export type DayPlan = { date: string; sessions: Session[] };

export function sessionKey(examId: string, date: string) {
  return `${examId}|${date}`;
}

/** Weaker topics (low confidence) get a bigger share of study days. */
function weight(topic: Topic) {
  return 6 - topic.confidence;
}

/**
 * One session per exam per day, from today until the exam.
 * Topics are spread with a smooth weighted round-robin, so a topic rated 1
 * comes up five times as often as one rated 5, and they stay interleaved.
 * The day before the exam is always a full review.
 */
export function buildSchedule(exams: Exam[], today: string): DayPlan[] {
  const byDate = new Map<string, Session[]>();
  const add = (exam: Exam, date: string, title: string, minutes: number, kind: Session["kind"]) => {
    const list = byDate.get(date) ?? [];
    list.push({ key: sessionKey(exam.id, date), examId: exam.id, subject: exam.subject, date, title, minutes, kind });
    byDate.set(date, list);
  };

  for (const exam of exams) {
    const days = daysBetween(today, exam.date);
    if (days < 0) continue;
    if (days === 0) {
      add(exam, today, "Quick skim of your notes, then rest. You've got this.", 15, "exam-day");
      continue;
    }

    const topics: Topic[] = exam.topics.length
      ? exam.topics
      : [{ id: "general", name: "General review", confidence: 3 }];
    const weights = topics.map(weight);
    const total = weights.reduce((a, b) => a + b, 0);
    const current = topics.map(() => 0);

    for (let i = 0; i < days - 1; i++) {
      let best = 0;
      for (let j = 0; j < topics.length; j++) {
        current[j] += weights[j];
        if (current[j] > current[best]) best = j;
      }
      current[best] -= total;
      add(exam, addDays(today, i), topics[best].name, 20 + 5 * weights[best], "study");
    }

    const weakest = [...topics]
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 2)
      .map((t) => t.name)
      .join(" & ");
    add(exam, addDays(exam.date, -1), `Full review, extra time on ${weakest}`, 45, "review");
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, sessions]) => ({ date, sessions }));
}
