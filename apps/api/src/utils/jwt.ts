import jwt from "jsonwebtoken";
import { env } from "../bootstrapEnv.js";

export function signToken(payload: { sub: string; username: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { sub: string; username: string } {
  const secret = env.JWT_SECRET;
  const decoded = jwt.verify(token, secret);
  if (typeof decoded !== "object" || decoded === null) {
    throw new Error("Invalid token payload");
  }
  const sub = "sub" in decoded ? String((decoded as { sub: unknown }).sub) : "";
  const username =
    "username" in decoded
      ? String((decoded as { username: unknown }).username)
      : "";
  if (!sub || !username) {
    throw new Error("Invalid token payload");
  }
  return { sub, username };
}
