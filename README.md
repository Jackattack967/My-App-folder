# Study Hub

An all-in-one study app for high school students: AI flashcards, an exam countdown planner, and an essay outline helper. See `CLAUDE.md` for the full product plan.

## Run it

```bash
npm install
cp .env.example .env.local   # then paste the API key into .env.local
npm run dev
```

Open http://localhost:3000. On your phone (same Wi-Fi), open `http://<your-computer's-IP>:3000`.

The exam planner and manual flashcards work without a key. "Make cards from notes" and "Plan my essay" need `ANTHROPIC_API_KEY`. A parent or guardian has to create the Anthropic account and key (accounts require an adult).

## How it's built

- Next.js (App Router) + TypeScript + Tailwind CSS
- Everything is saved in the browser (localStorage). No accounts yet.
- AI calls go through server routes (`src/app/api/flashcards`, `src/app/api/outline`) so the key never reaches the browser. They use Claude Haiku 5.5 (small and cheap) with structured output.

| Where | What |
| --- | --- |
| `src/components/flashcards/` | Decks, study mode (flip, "got it" / "again"), quiz mode, generate from notes |
| `src/components/planner/` | Exams, countdown, day-by-day study plan |
| `src/components/essay/` | Essay outline helper |
| `src/lib/schedule.ts` | How the study plan gives weaker topics more time |
| `src/lib/claude.ts` | Claude API helper (server only) |
| `src/lib/examples.ts` | Example content each tool opens with |

## Deploy

Push to GitHub, import the repo on Vercel, and add `ANTHROPIC_API_KEY` under Project Settings → Environment Variables.
