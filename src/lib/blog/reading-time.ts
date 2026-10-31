const WORDS_PER_MINUTE: Record<string, number> = { fa: 180, ar: 180 };
const DEFAULT_WPM = 200;

function collectText(value: unknown, out: string[]): void {
  if (typeof value === 'string') out.push(value.replace(/<[^>]*>/g, ' '));
  else if (Array.isArray(value)) value.forEach((v) => collectText(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectText(v, out));
}

/** Minutes to read all section text, at least 1. */
export function readingTime(sections: Array<{ data?: unknown }>, language: string): number {
  const parts: string[] = [];
  sections.forEach((s) => collectText(s.data, parts));
  const words = parts.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / (WORDS_PER_MINUTE[language] ?? DEFAULT_WPM)));
}
