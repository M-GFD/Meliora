import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export function signToken(payload: { sub: string; username: string }): string {
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): { sub: string; username: string } {
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
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
