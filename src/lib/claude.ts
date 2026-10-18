import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type * as z from "zod";

// Server-only: imported by the API routes, never by components, so the
// API key stays on the server.

// A small, fast model keeps flashcards and outlines cheap.
const MODEL = "claude-haiku-5-5";

export class AIError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let client: Anthropic | undefined;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AIError(
      "AI features aren't set up yet. Add ANTHROPIC_API_KEY to .env.local and restart the app.",
      503,
    );
  }
  client ??= new Anthropic();
  return client;
}

export async function generate<S extends z.ZodType>({
  system,
  prompt,
  schema,
}: {
  system: string;
  prompt: string;
  schema: S;
}): Promise<z.infer<S>> {
  try {
    const response = await getClient().messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system,
      messages: [{ role: "user", content: prompt }],
      output_config: { effort: "low", format: zodOutputFormat(schema) },
    });

    if (response.stop_reason === "refusal") {
      throw new AIError("Claude couldn't help with that text. Try different notes or wording.", 422);
    }
    if (response.parsed_output == null) {
      throw new AIError("Claude's answer came back incomplete. Please try again.", 502);
    }
    return response.parsed_output;
  } catch (err) {
    if (err instanceof AIError) throw err;
    if (err instanceof Anthropic.AuthenticationError) {
      throw new AIError("The API key isn't working. Check ANTHROPIC_API_KEY in .env.local.", 503);
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new AIError("Lots of requests right now. Wait a minute and try again.", 429);
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new AIError("Couldn't reach Claude. Check your internet connection.", 503);
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error", err.status, err.message);
      throw new AIError("Claude had a problem. Try again in a moment.", 502);
    }
    throw err;
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof AIError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export function badRequest(error: z.ZodError) {
  return Response.json(
    { error: error.issues[0]?.message ?? "That request didn't look right." },
    { status: 400 },
  );
}
