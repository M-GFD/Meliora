import type { NextFunction, Request, Response } from "express";
import type { RequestWithId } from "./requestId.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // eslint-disable-next-line no-console
  console.error(err);
  const requestId = (req as RequestWithId).requestId;
  const message = "Internal server error";
  res.status(500).json({ error: message, requestId });
}
