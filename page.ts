// Server-rendered shell for the course. Hash routing still paints the
// interactive page; this HTML is what a fetch of `/` or `/persona` contains.

export type Lesson = {
  slug: string;
  title: string;
  short: string;
  minutes: number;
  one: string;
  weak: string;
  strong: string;
};

export function loadLessons(src: string): Lesson[] {
  const window: { LESSONS?: Lesson[] } = {};
  const lessons = new Function("window", `${src}\nreturn window.LESSONS;`)(window);
  return Array.isArray(lessons) ? lessons : [];
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Drop [[text|n]] marks so the strong pane is readable without the client. */
export function plainPrompt(value: string): string {
  return value.replaceAll(/\[\[([^|\]]+)\|[^\]]+\]\]/g, "$1");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function renderHome(lessons: Lesson[]): string {
  const rows = lessons.map((lesson, index) =>
    `<a class="row" href="/${escapeHtml(lesson.slug)}"><span class="num">${pad(index + 1)}</span><span class="t">${escapeHtml(lesson.title)}</span></a>`
  ).join("");
  return `<section class="hero"><p class="eyebrow mono">/ A short course · ten lessons</p><h1>Prompting for attorneys</h1><div class="list">${rows}</div></section>`;
}

export function renderLesson(lessons: Lesson[], slug: string): string | null {
  const lesson = lessons.find((item) => item.slug === slug);
  if (!lesson) return null;
  return `<article class="art"><h1>${escapeHtml(lesson.title)}</h1><div class="cmp" id="cmp">
<div class="pane without"><div class="ph"><span class="mono">Without</span></div><div class="prompt">${escapeHtml(lesson.weak)}</div></div>
<div class="pane with"><div class="ph"><span class="mono">With the technique</span></div><div class="prompt">${escapeHtml(plainPrompt(lesson.strong))}</div></div>
</div></article>`;
}

export function fillIndex(html: string, inner: string): string {
  const slot = '<main id="app" class="wrap"></main>';
  if (!html.includes(slot)) throw new Error("index slot missing");
  return html.replace(slot, `<main id="app" class="wrap">${inner}</main>`);
}

export function renderPage(indexHtml: string, lessonsSrc: string, slug: string | null): string | null {
  const lessons = loadLessons(lessonsSrc);
  if (slug) {
    const inner = renderLesson(lessons, slug);
    if (!inner) return null;
    return fillIndex(indexHtml, inner);
  }
  return fillIndex(indexHtml, renderHome(lessons));
}
