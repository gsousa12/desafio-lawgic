/**
 *  Pega uma janela de páginas para paginação
 * @param current
 * @param total
 * @param max
 * @returns
 */

export function getPageWindow(
  current: number,
  total: number,
  max = 5
): number[] {
  if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = start + max - 1;

  if (end > total) {
    end = total;
    start = end - max + 1;
  }

  const pages: number[] = [];
  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push(-1);
  }

  for (let p = start; p <= end; p++) pages.push(p);

  if (end < total) {
    if (end < total - 1) pages.push(-1);
    pages.push(total);
  }

  return pages;
}
