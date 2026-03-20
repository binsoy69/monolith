export function formatPeso(cents: number): string {
  const pesos = cents / 100
  if (pesos % 1 === 0) return `₱${pesos.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  return `₱${pesos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
