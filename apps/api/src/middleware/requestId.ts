import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

export interface RequestWithId extends Request {
  requestId?: string;
}

export function requestId(req: RequestWithId, res: Response, next: NextFunction): void {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}

