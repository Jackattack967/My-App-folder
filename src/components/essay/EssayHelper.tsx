"use client";

import { useState, type FormEvent } from "react";
import { postJSON } from "@/lib/api";
import { EXAMPLE_OUTLINES } from "@/lib/examples";
import { ESSAY_TYPES, type EssayOutline, type EssayType } from "@/lib/schemas";
import { uid, useStored } from "@/lib/storage";
import type { SavedOutline } from "@/lib/types";
import { Button, Card, ErrorNote, ExampleBanner, Label, Spinner, inputClass } from "../ui";

const TYPE_HINT: Record<EssayType, string> = {
  argumentative: "Take a side and defend it",
  analytical: "Break down a text or topic",
  narrative: "Tell a story with a point",
};

export function EssayHelper() {
  const [outlines, setOutlines, isExample] = useStored<SavedOutline[]>("studyhub:outlines", EXAMPLE_OUTLINES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [essayType, setEssayType] = useState<EssayType>("argumentative");
  const [wordCount, setWordCount] = useState(800);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = outlines.find((o) => o.id === selectedId) ?? outlines[0];

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { outline } = await postJSON<{ outline: EssayOutline }>("/api/outline", { prompt, essayType, wordCount });
      const saved: SavedOutline = { id: uid(), prompt: prompt.trim(), essayType, wordCount, createdAt: Date.now(), outline };
      setOutlines([saved, ...(isExample ? [] : outlines)]);
      setSelectedId(saved.id);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function remove(id: string) {
    if (!confirm("Delete this outline?")) return;
    setOutlines(outlines.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="essay-prompt">Essay prompt</Label>
            <textarea
              id="essay-prompt"
              rows={3}
              className={inputClass}
              placeholder="Paste the prompt your teacher gave you…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">Type of essay</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ESSAY_TYPES.map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-xl px-3 py-2.5 ring-1 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-violet-500 ${
                    essayType === t
                      ? "bg-violet-50 ring-2 ring-violet-500 dark:bg-violet-950/50"
                      : "ring-slate-300 hover:bg-slate-50 dark:ring-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  <input type="radio" name="essay-type" value={t} checked={essayType === t} onChange={() => setEssayType(t)} className="sr-only" />
                  <span className="block font-semibold capitalize">{t}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{TYPE_HINT[t]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="word-count">Word count</Label>
              <input
                id="word-count"
                type="number"
                inputMode="numeric"
                min={100}
                max={5000}
                step={50}
                className={`${inputClass} w-32`}
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
              />
            </div>
            <Button type="submit" disabled={loading || prompt.trim().length < 10 || wordCount < 100 || wordCount > 5000}>
              {loading ? (
                <>
                  <Spinner /> Planning…
                </>
              ) : (
                "Plan my essay"
              )}
            </Button>
          </div>
          {error && <ErrorNote>{error}</ErrorNote>}
        </form>
      </Card>

      {isExample && <ExampleBanner what="outline" onClear={() => setOutlines([])} />}

      {outlines.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="list" aria-label="Saved outlines">
          {outlines.map((o) => (
            <button
              key={o.id}
              type="button"
              role="listitem"
              onClick={() => setSelectedId(o.id)}
              className={`max-w-56 shrink-0 truncate rounded-full px-3 py-1.5 text-sm font-medium ring-1 focus-visible:outline-2 focus-visible:outline-violet-500 ${
                o.id === selected?.id
                  ? "bg-violet-600 text-white ring-violet-600"
                  : "bg-white ring-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              {o.prompt}
            </button>
          ))}
        </div>
      )}

      {selected && <OutlineView saved={selected} onDelete={() => remove(selected.id)} />}
    </div>
  );
}

function outlineAsText({ prompt, outline }: SavedOutline) {
  const lines = [`PROMPT: ${prompt}`, "", `WORKING THESIS: ${outline.thesis}`, ""];
  for (const p of outline.paragraphs) {
    lines.push(`${p.label} (~${p.approxWords} words): ${p.mainPoint}`);
    p.points.forEach((pt) => lines.push(`  - ${pt}`));
    p.evidenceToFind.forEach((ev) => lines.push(`  * Find: ${ev}`));
    lines.push("");
  }
  lines.push("EVIDENCE TO LOOK FOR:", ...outline.evidenceToLookFor.map((e) => `  - ${e}`), "");
  lines.push("QUESTIONS TO THINK ABOUT:", ...outline.questionsToConsider.map((q) => `  - ${q}`));
  return lines.join("\n");
}

function OutlineView({ saved, onDelete }: { saved: SavedOutline; onDelete: () => void }) {
  const { outline } = saved;
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(outlineAsText(saved));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing else to do.
    }
  }

  return (
    <article className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
          <span className="capitalize">{saved.essayType}</span> · about {saved.wordCount} words
        </p>
        <h2 className="text-xl font-bold">{saved.prompt}</h2>
      </div>

      <p className="rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-900 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-900">
        ✍️ This is a plan, not an essay. Use it to organise your ideas, then write every sentence in your own words.
      </p>

      <Card className="bg-gradient-to-br from-violet-50 to-fuchsia-50 ring-violet-200 dark:from-violet-950/40 dark:to-fuchsia-950/30 dark:ring-violet-900">
        <h3 className="text-xs font-semibold tracking-wide text-violet-700 dark:text-violet-300">WORKING THESIS</h3>
        <p className="mt-1 text-lg font-semibold">{outline.thesis}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">💡 {outline.thesisTip}</p>
      </Card>

      <ol className="space-y-3">
        {outline.paragraphs.map((p, i) => (
          <li key={i}>
            <Card>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-bold">{p.label}</h3>
                <span className="shrink-0 text-sm text-slate-500 tabular-nums dark:text-slate-400">~{p.approxWords} words</span>
              </div>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{p.mainPoint}</p>
              {p.points.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {p.points.map((pt, j) => (
                    <li key={j}>{pt}</li>
                  ))}
                </ul>
              )}
              {p.evidenceToFind.length > 0 && (
                <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                  <span className="font-semibold">🔎 Find: </span>
                  {p.evidenceToFind.join(" · ")}
                </div>
              )}
            </Card>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <h3 className="font-bold">🔎 Evidence to look for</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {outline.evidenceToLookFor.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="text-slate-400">☐</span>
                {e}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="font-bold">🤔 Questions to think about</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            {outline.questionsToConsider.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" onClick={copy}>
          {copied ? "Copied ✓" : "Copy outline"}
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </article>
  );
}
