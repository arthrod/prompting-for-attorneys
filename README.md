# Prompting for attorneys

Ten short lessons on prompting techniques for lawyers. The hosted copy is
[arthrod/prompting-for-attorneys](https://arthrod--743c307ed96511f1a2af1607ee4eb77e.web.val.run/).

The overview is `GET /`. Each lesson is also a path (`/persona`, and the other nine slugs) and a hash (`#/persona`). The try-it box posts to `POST /api/complete`. Lesson text stays in `js/lessons.js`. This README does not repeat it.

## Try-it

Model calls use Val Town's free OpenAI integration (`https://esm.town/v/std/openai`, no API key). The model constant is `gpt-5-nano`. The request sends `max_completion_tokens: 1200`. It sends `reasoning_effort: "none"` only when that model accepts the value (`reasoning.ts`). Other models are left on their default, because a non-reasoning model rejects the field and several reasoning models reject `"none"`.

Limits, in `ratelimit.ts`: 3 tries per IP per 10 minutes, 4 tries for the whole val per minute, and prompts capped at 4,000 characters. Prompts are not stored. The log records length only. A model failure returns HTTP 500 with `{ error }`. A success returns `{ text }`.

The try-it box has a `Run alongside` selector (Weak / Strong / None). Loading the weak prompt pairs it with the strong one, loading the strong prompt pairs it with the weak one, and a custom prompt keeps whatever was picked. A paired run posts the two prompts one after the other and shows the two responses side by side (stacked under 900px). A `Model` selector offers GLM-5.3-Flash, GLM-5.3-FlashX-Legal or Both; the request carries `model` with the chosen id (`glm-5.3-flash`, `glm-5.3-flashx-legal`), which `main.http.ts` does not read yet, so every run still goes to `MODEL` until the route maps those ids to providers. Each prompt × model combination is one run, shown in its own column; the note under the box counts them against the three per-IP tries.

Contact on the page goes to https://arthur.law/contact/. The header reads `arthur.law / Learn Prompting`: the first goes to https://arthur.law/, the second to the course overview. A− and A+ step the body text through 15, 16, 18, 20 and 22px (two clicks each way from 18px) and deepen in tone with each click; the choice persists in `localStorage`.

## Layout

```
index.html            shell
main.http.ts          HTTP entry: pages and /api/complete
page.ts               server-rendered home and lesson HTML
ratelimit.ts          in-memory cap for try-it
reasoning.ts          when to send reasoning_effort
css/ js/              browser course
```

`lessons.js` loads before `app.js`. Stylesheet order in `index.html` is the cascade order. `responsive.css` stays last. Font files are not uploaded to Val Town; `css/fonts.css` loads them from jsDelivr.

## Lesson navigation

On desktop the lesson list has two modes, kept in `localStorage` (`asr-prompting-rail`). `mini`, the default, is a strip of numbered squares fixed in the left gutter outside the page column, so the article takes the full page width; hovering or focusing the strip opens it as a flyout, and `Pin` switches to `full`, the 240px list beside a 760px article. Under 900px the list is a sheet that opens from the `Lesson 01 / 10 ↑` button in the bottom bar; Escape, the backdrop or `↓` closes it. Done lessons carry a yellow square in every list; the header dots carry the same state, so no counter is repeated in the list.

## Check and deploy

```sh
deno test --no-config --allow-read page_test.ts course_test.ts ratelimit_test.ts reasoning_test.ts
```

The Git repository is https://github.com/arthrod/prompting-for-attorneys. `.vt/` is local Val Town linkage and is not committed. Review `vt push --dry-run` before `vt push`. Do not copy another val's `.vt/` into this directory.
