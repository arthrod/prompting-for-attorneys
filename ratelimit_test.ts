import { assertEquals } from "jsr:@std/assert@1";
import { createLimiter, decide, LIMITS } from "./ratelimit.ts";

Deno.test("decide refuses once the val-wide window is full", () => {
  assertEquals(decide(0, LIMITS.global).ok, false);
  assertEquals(decide(0, LIMITS.global - 1).ok, true);
});

Deno.test("decide refuses one caller before the val-wide cap", () => {
  assertEquals(decide(LIMITS.perIp, 0).ok, false);
  assertEquals(decide(LIMITS.perIp - 1, 0).ok, true);
});

Deno.test("the limiter counts a caller and then stops them", () => {
  let t = 1_000_000;
  const limiter = createLimiter(() => t);
  for (let i = 0; i < LIMITS.perIp; i++) assertEquals(limiter.take("a").ok, true);
  assertEquals(limiter.take("a").ok, false);
  // A different caller still fits while the val-wide window has room.
  if (LIMITS.perIp < LIMITS.global) assertEquals(limiter.take("b").ok, true);
  t += LIMITS.perIpWindowMs + 1;
  assertEquals(limiter.take("a").ok, true);
});
