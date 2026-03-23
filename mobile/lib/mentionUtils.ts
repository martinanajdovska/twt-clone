export function getMentionTrigger(
  text: string,
  cursorPosition: number,
): { query: string; atIndex: number } | null {
  const before = text.slice(0, cursorPosition);
  const match = before.match(/@(\w*)$/);
  if (!match) return null;
  const atIndex = before.length - match[0].length;
  return { query: match[1], atIndex };
}
