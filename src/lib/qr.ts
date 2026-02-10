import jwt from "jsonwebtoken";
const secret = process.env.QR_SECRET || "dev-secret-change-me";
export function signTicketPayload(payload: { ticketId: string; eventId: string }) {
  return jwt.sign(payload, secret, { expiresIn: "365d" });
}
export function verifyTicketPayload(token: string): { ticketId: string; eventId: string } | null {
  try { return jwt.verify(token, secret) as any; } catch { return null; }
}
