// HTTP val: the course pages, plus one try-it route on Val Town's free OpenAI.
// No API key. Prompts are not stored.
import { Hono } from "npm:hono@4.13.12";
import { readFile, serveFile } from "https://esm.town/v/std/utils/index.ts";
import { OpenAI } from "https://esm.town/v/std/openai";
import { createLimiter, LIMITS } from "./ratelimit.ts";
import { renderPage } from "./page.ts";

const SYSTEM =
  "You are assisting a lawyer who is practising prompting techniques. Answer the prompt directly and professionally. Do not add disclaimers about seeking legal counsel.";
const MODEL = "gpt-5-nano";

const app = new Hono();
const limiter = createLimiter();
const openai = new OpenAI();

app.onError((err, _c) => {
  throw err;
});

function isSafeAssetPath(p: string): boolean {
  let decoded = p;
  try {
    decoded = decodeURIComponent(p);
  } catch {
    return false;
  }
  return !decoded.includes("..") && !p.includes("..");
}

function callerIp(c: { req: { header: (name: string) => string | undefined } }): string {
  const forwarded = c.req.header("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? c.req.header("cf-connecting-ip") ?? "unknown").trim();
}

function cors(c: { header: (k: string, v: string) => void }) {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "content-type");
}

app.options("/api/complete", (c) => {
  cors(c);
  return c.body(null, 204);
});

app.post("/api/complete", async (c) => {
  cors(c);
  const header = c.req.header("content-length");
  const length = header !== undefined ? Number(header) : (await c.req.raw.clone().arrayBuffer()).byteLength;
  if (!Number.isFinite(length) || length > 16 * 1024) {
    return c.json({ error: "request too large" }, 413);
  }
  let body: { prompt?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON body" }, 400);
  }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) return c.json({ error: "empty prompt" }, 400);
  if (prompt.length > LIMITS.maxPromptChars) {
    return c.json({ error: "prompt too long" }, 413);
  }
  const verdict = limiter.take(callerIp(c));
  if (!verdict.ok) {
    c.header("Retry-After", String(verdict.retryAfterS ?? 60));
    return c.json({ error: "Too many requests to the model; try again in a minute." }, 429);
  }
  // Length only. The prompt itself is not logged or stored.
  console.log("[complete] chars=", prompt.length);
  let text = "";
  try {
    // Cap the completion so one try-it cannot spend the shared
    // std/openai quota on a long answer.
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 1200,
      reasoning_effort: "minimal",
    });
    text = completion.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    console.log("[complete] model error", err instanceof Error ? err.message : "unknown");
    return c.json({ error: "The model could not be reached." }, 502);
  }
  if (!text) return c.json({ error: "The model returned no text." }, 502);
  return c.json({ text });
});

for (const prefix of ["/css/*", "/js/*", "/fonts/*"]) {
  app.get(prefix, (c) =>
    isSafeAssetPath(c.req.path) ? serveFile(c.req.path, import.meta.url) : c.text("Forbidden", 403));
}

async function htmlPage(slug: string | null): Promise<string | null> {
  const [indexHtml, lessonsSrc] = await Promise.all([
    readFile("/index.html", import.meta.url),
    readFile("/js/lessons.js", import.meta.url),
  ]);
  return renderPage(indexHtml, lessonsSrc, slug);
}

app.get("/", async (c) => {
  const html = await htmlPage(null);
  return c.html(html ?? "");
});
app.get("/index.html", async (c) => {
  const html = await htmlPage(null);
  return c.html(html ?? "");
});
app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  if (!slug || slug.includes(".")) return c.text("Not found", 404);
  const html = await htmlPage(slug);
  if (!html) return c.text("Not found", 404);
  return c.html(html);
});

export default app.fetch;
