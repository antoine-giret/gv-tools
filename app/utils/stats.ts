export function formatNumber(value: number): string {
  return (value || 0)
    .toString()
    .replace(/\./, ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}
