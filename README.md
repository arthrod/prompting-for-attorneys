# Prompting for attorneys

Ten short lessons on prompting techniques for lawyers. The hosted copy is
[arthrod/prompting-for-attorneys](https://arthrod--743c307ed96511f1a2af1607ee4eb77e.web.val.run/).

The overview is `GET /`. Each lesson is also a path (`/persona`, and the other nine slugs) and a hash (`#/persona`). The try-it box posts to `POST /api/complete`. Lesson text stays in `js/lessons.js`. This README does not repeat it.

## Try-it

Model calls use Val Town's free OpenAI integration (`https://esm.town/v/std/openai`, no API key). The model constant is `gpt-5-nano`. The request sends `max_completion_tokens: 1200`. It sends `reasoning_effort: "none"` only when that model accepts the value (`reasoning.ts`). Other models are left on their default, because a non-reasoning model rejects the field and several reasoning models reject `"none"`.

Limits, in `ratelimit.ts`: 3 tries per IP per 10 minutes, 4 tries for the whole val per minute, and prompts capped at 4,000 characters. Prompts are not stored. The log records length only. A model failure returns HTTP 500 with `{ error }`. A success returns `{ text }`.

Contact on the page goes to https://arthur.law/contact/. The wordmark goes to https://arthur.law/.

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

## Check and deploy

```sh
deno test --no-config --allow-read page_test.ts course_test.ts ratelimit_test.ts reasoning_test.ts
```

The Git repository is https://github.com/arthrod/prompting-for-attorneys. `.vt/` is local Val Town linkage and is not committed. Review `vt push --dry-run` before `vt push`. Do not copy another val's `.vt/` into this directory.
