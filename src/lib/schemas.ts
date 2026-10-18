import * as z from "zod";

// Shapes shared by the API routes (requests + what Claude returns)
// and the components that display them.

export const ESSAY_TYPES = ["argumentative", "analytical", "narrative"] as const;
export type EssayType = (typeof ESSAY_TYPES)[number];

export const FlashcardsRequest = z.object({
  notes: z
    .string()
    .trim()
    .min(20, "Paste a bit more of your notes (at least a couple of sentences).")
    .max(20_000, "That's a lot of notes! Paste up to about 20,000 characters at a time."),
  count: z.number().int().min(3).max(30),
});

export const FlashcardsOutput = z.object({
  cards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
});
export type GeneratedCard = z.infer<typeof FlashcardsOutput>["cards"][number];

export const OutlineRequest = z.object({
  prompt: z
    .string()
    .trim()
    .min(10, "Add the full essay prompt so the outline fits it.")
    .max(3_000, "Keep the prompt under 3,000 characters."),
  essayType: z.enum(ESSAY_TYPES),
  wordCount: z.number().int().min(100).max(5_000),
});

export const EssayOutlineSchema = z.object({
  thesis: z.string().describe("One working thesis sentence for the student to rework."),
  thesisTip: z.string().describe("One sentence on how to make the thesis their own."),
  paragraphs: z.array(
    z.object({
      label: z.string().describe('Short heading, e.g. "Intro", "Body 1: Cost", "Conclusion".'),
      approxWords: z.number().describe("Rough word budget for this paragraph."),
      mainPoint: z.string().describe("What this paragraph needs to do, as a short note."),
      points: z.array(z.string()).describe("2-4 short bullet notes, fragments not sentences."),
      evidenceToFind: z.array(z.string()).describe("Kinds of evidence or details to look for."),
    }),
  ),
  evidenceToLookFor: z.array(z.string()).describe("Overall research checklist."),
  questionsToConsider: z.array(z.string()).describe("3-4 questions to push the student's own thinking."),
});
export type EssayOutline = z.infer<typeof EssayOutlineSchema>;
