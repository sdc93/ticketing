export function feePerTicketCents(basePriceCents: number): number {
  const pct = Math.round(basePriceCents * 0.08);
  return Math.max(100, pct);
}
