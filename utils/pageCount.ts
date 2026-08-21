// Acceptă doar întregi pozitive — nu "0", nu gol, nu "12abc".
export function parsePageCount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
