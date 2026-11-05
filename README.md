# Prompting for attorneys

Ten short lessons on prompting techniques for lawyers. Static pages, hash routes (`#/persona` and the rest), and a try-it box that calls this Val Town HTTP val.

The lesson text stays in `js/lessons.js`. This file does not repeat it.

## Run

The public val serves the pages and `POST /api/complete`. Model calls use Val Town's free OpenAI integration (`std/openai`, `gpt-5-nano`, no API key). Try-it is capped so one visitor cannot spend the shared 10-per-minute quota. Prompts are not stored.

Contact on the home page goes to https://arthur.law/contact/.

## Layout

```
index.html
main.http.ts          Val Town HTTP entry: pages plus /api/complete
ratelimit.ts          in-memory cap for try-it
css/ js/ fonts/
```

`lessons.js` loads before `app.js`. Stylesheet order in `index.html` is the cascade order; `responsive.css` stays last.
