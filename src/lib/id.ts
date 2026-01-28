import crypto from "crypto";

export function generateId(): string {
  return crypto.randomBytes(8).toString("hex");
}
