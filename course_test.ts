import { assertEquals } from "jsr:@std/assert@1";

const SLUGS = [
  "persona",
  "context",
  "constraints",
  "examples",
  "steps",
  "extract",
  "drafting",
  "ambiguity",
  "jurisdictions",
  "recency",
];

Deno.test("the bundle still has the ten lessons and the live try-it wiring", async () => {
  const lessons = await Deno.readTextFile(new URL("./js/lessons.js", import.meta.url));
  const slugs = [...lessons.matchAll(/slug:"([^"]+)"/g)].map((m) => m[1]);
  assertEquals(slugs, SLUGS);

  const app = await Deno.readTextFile(new URL("./js/app.js", import.meta.url));
  assertEquals(app.includes("window.claude"), false);
  assertEquals(app.includes("https://arthur.law/contact/"), true);
  assertEquals(app.includes("fetch('/api/complete'"), true);
  assertEquals(app.includes("sk-"), false);

  const css = await Deno.readTextFile(new URL("./css/tokens.css", import.meta.url));
  for (const banned of ["#00274C", "#FF5C00", "#1F8A5B", "#2A6FDB", "#1E1E1E", "#2A2A2A", "#333333", "#FFFFFF"]) {
    assertEquals(css.includes(banned), false, banned);
  }
  const base = await Deno.readTextFile(new URL("./css/base.css", import.meta.url));
  assertEquals(base.includes("#4A4A47"), false);

  const server = await Deno.readTextFile(new URL("./main.http.ts", import.meta.url));
  assertEquals(server.includes("max_completion_tokens"), true);
  assertEquals(server.includes("max_tokens"), false);
  assertEquals(server.includes("https://esm.town/v/std/openai"), true);
  assertEquals(server.includes("sk-"), false);
});
