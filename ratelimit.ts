// Caps try-it so one visitor cannot spend the shared std/openai quota
// (10 requests per minute across every arthrod val). In-memory only:
// prompts are not stored. Approximate when Val Town runs several isolates.

export const LIMITS = {
  perIp: 3,
  perIpWindowMs: 600_000,
  global: 4,
  globalWindowMs: 60_000,
  maxPromptChars: 4_000,
};

export function decide(
  perIpCount: number,
  globalCount: number,
): { ok: boolean; retryAfterS?: number } {
  if (globalCount >= LIMITS.global) {
    return { ok: false, retryAfterS: Math.ceil(LIMITS.globalWindowMs / 1000) };
  }
  if (perIpCount >= LIMITS.perIp) {
    return { ok: false, retryAfterS: Math.ceil(LIMITS.perIpWindowMs / 1000) };
  }
  return { ok: true };
}

export interface Limiter {
  take(ip: string): { ok: boolean; retryAfterS?: number };
}

export function createLimiter(now: () => number = Date.now): Limiter {
  const perIp = new Map<string, number[]>();
  let global: number[] = [];
  return {
    take(ip: string) {
      const t = now();
      global = global.filter((x) => t - x < LIMITS.globalWindowMs);
      const mine = (perIp.get(ip) ?? []).filter((x) => t - x < LIMITS.perIpWindowMs);
      const verdict = decide(mine.length, global.length);
      if (verdict.ok) {
        mine.push(t);
        global.push(t);
      }
      if (mine.length) perIp.set(ip, mine);
      else perIp.delete(ip);
      return verdict;
    },
  };
}
