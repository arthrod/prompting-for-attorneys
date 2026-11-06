// Chat Completions `reasoning_effort` is model-dependent. "none" is the right
// value for this short try-it when the model accepts it: gpt-5-nano defaults
// to medium and will spend max_completion_tokens on hidden reasoning.
// Omit the field otherwise. Non-reasoning models reject it, and several
// reasoning models reject the value "none" (gpt-5-pro, gpt-6-astra, gpt-6.1-sol).

const SNAPSHOT = /^(\d{4}-\d{2}-\d{2})$/;

/** `{ reasoning_effort: "none" }` when `model` accepts that value. */
export function reasoningParams(model: string): { reasoning_effort: "none" } | undefined {
  return acceptsReasoningNone(model) ? { reasoning_effort: "none" } : undefined;
}

function acceptsReasoningNone(model: string): boolean {
  const id = model.trim().toLowerCase();
  if (id === "gpt-5-nano") return true;
  if (id.startsWith("gpt-5-nano-")) return SNAPSHOT.test(id.slice("gpt-5-nano-".length));

  // gpt-5.1 and later document "none". Original gpt-5 and gpt-5-mini do not
  // (their guide lists minimal, low, medium, high), and this proxy was not
  // checked for them. Pro models are high-only.
  const later = id.match(/^gpt-5\.(\d+)(?:-(.+))?$/);
  if (!later) return false;
  if (Number(later[1]) < 1) return false;
  const parts = (later[2] ?? "").split("-").filter(Boolean);
  const dated = parts.length >= 3 && SNAPSHOT.test(parts.slice(-3).join("-"));
  const name = dated ? parts.slice(0, -3) : parts;
  if (name.includes("pro") || name.includes("chat")) return false;
  return true;
}
