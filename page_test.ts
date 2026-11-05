import { assertEquals } from "jsr:@std/assert@1";
import { loadLessons, renderHome, renderLesson, renderPage } from "./page.ts";

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

const TITLES = [
  "Give the model a role",
  "Supply the facts, not just the question",
  "Set conditions and a scope",
  "Show one example of what you want",
  "Ask for the reasoning, step by step",
  "Extract the clause, don’t summarize the contract",
  "Specify the clause you want drafted",
  "Ask for every plausible reading",
  "Compare jurisdictions side by side",
  "Put what matters most at the end",
];

Deno.test("the served pages list every lesson and both panes", async () => {
  const src = await Deno.readTextFile(new URL("./js/lessons.js", import.meta.url));
  const index = await Deno.readTextFile(new URL("./index.html", import.meta.url));
  const lessons = loadLessons(src);
  assertEquals(lessons.map((lesson) => lesson.slug), SLUGS);
  assertEquals(lessons.map((lesson) => lesson.title), TITLES);

  const home = renderPage(index, src, null);
  if (!home) throw new Error("home page missing");
  for (const title of TITLES) assertEquals(home.includes(title), true, title);
  assertEquals(home.includes('href="/persona"'), true);
  assertEquals(home.includes('class="brand" href="https://arthur.law/"'), true);

  const lesson = renderPage(index, src, "persona");
  if (!lesson) throw new Error("lesson page missing");
  assertEquals(lesson.includes("Give the model a role"), true);
  assertEquals(lesson.includes('class="brand" href="https://arthur.law/"'), true);
  assertEquals(lesson.includes('class="pane without"'), true);
  assertEquals(lesson.includes('class="pane with"'), true);
  assertEquals(lesson.includes(">Without<"), true);
  assertEquals(lesson.includes(">With the technique<"), true);
  assertEquals(renderLesson(lessons, "missing"), null);

  const listed = renderHome(lessons);
  assertEquals(listed.includes(TITLES[9]), true);
});
