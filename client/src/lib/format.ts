/**
 * Tiny presentation helper — e.g. `pluralize(1, 'result')` -> "1 result".
 * Nothing special; it exists mainly to anchor the example test and show the
 * testing setup works. Real signal comes from the tests YOU add.
 */
export function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
