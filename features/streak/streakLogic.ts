import type { User } from "@/types";

/**
 * Calculul streak-ului trebuie făcut mereu în fusul orar LOCAL al userului,
 * niciodată în UTC — o greșeală aici sparge încrederea userilor rapid
 * (ex. un user din România citește la 23:30, dar UTC încă arată ziua
 * anterioară, deci streak-ul s-ar rupe greșit). Vezi AGENTS.md.
 */
function getLocalDateString(timestamp: number, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export function isSameLocalDay(a: number, b: number, timezone: string): boolean {
  return getLocalDateString(a, timezone) === getLocalDateString(b, timezone);
}

export function isConsecutiveDay(previous: number, current: number, timezone: string): boolean {
  const prevDate = new Date(getLocalDateString(previous, timezone));
  const currDate = new Date(getLocalDateString(current, timezone));
  const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
  return diffDays === 1;
}

export interface StreakUpdateResult {
  newStreakCount: number;
  freezeConsumed: boolean;
  streakBroken: boolean;
}

// Apelată la fiecare activitate nouă (check-in sau focus timer finalizat).
export function updateStreak(
  user: Pick<User, "streakCount" | "freezesAvailable" | "timezone">,
  lastActivityTimestamp: number,
  now: number = Date.now(),
): StreakUpdateResult {
  if (isSameLocalDay(lastActivityTimestamp, now, user.timezone)) {
    // Deja activ azi — nu incrementa de două ori.
    return { newStreakCount: user.streakCount, freezeConsumed: false, streakBroken: false };
  }

  if (isConsecutiveDay(lastActivityTimestamp, now, user.timezone)) {
    return { newStreakCount: user.streakCount + 1, freezeConsumed: false, streakBroken: false };
  }

  // A trecut mai mult de o zi — verifică dacă are freeze disponibil.
  if (user.freezesAvailable > 0) {
    return { newStreakCount: user.streakCount + 1, freezeConsumed: true, streakBroken: false };
  }

  return { newStreakCount: 1, freezeConsumed: false, streakBroken: true };
}
