import { assertEquals } from "jsr:@std/assert@1";
import { reasoningParams } from "./reasoning.ts";

const NONE = { reasoning_effort: "none" as const };

Deno.test("reasoning_effort none is sent only for models that accept it", () => {
  for (const model of [
    "gpt-5-nano",
    "gpt-5-nano-2025-08-07",
    "gpt-5.1",
    "gpt-5.1-2025-11-13",
    "gpt-5.1-codex-mini",
    "gpt-5.4",
    "gpt-5.4-nano",
    "gpt-5.4-mini",
    "gpt-5.6-luna",
  ]) {
    assertEquals(reasoningParams(model), NONE, model);
  }
});

Deno.test("reasoning_effort is omitted when the model would reject none", () => {
  for (const model of [
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-mini-2025-08-07",
    "gpt-5-pro",
    "gpt-5.4-pro",
    "gpt-4.1-nano",
    "gpt-4o-mini",
    "gpt-4o",
    "gpt-6-astra",
    "gpt-6.1-sol",
    "gpt-6-sol",
    "o3",
    "o4-mini",
    "gpt-5-chat-latest",
    "gpt-5-nano-extra",
    "",
    "  ",
  ]) {
    assertEquals(reasoningParams(model), undefined, model);
  }
});
