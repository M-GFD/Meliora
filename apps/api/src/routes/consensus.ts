import { Router } from "express";
import { StatementIntent, VoteType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const consensusRouter = Router();

const statementSchema = z.object({
  content: z.string().min(1).max(280),
  intent: z.nativeEnum(StatementIntent),
});

const statementVoteSchema = z.object({
  type: z.nativeEnum(VoteType),
});

consensusRouter.get("/", async (_req, res, next) => {
  try {
    const spaces = await prisma.consensusSpace.findMany({
      where: { status: { in: ["ACTIVE", "MATURE"] } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({ spaces });
  } catch (e) {
    next(e);
  }
});

consensusRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid space id" });
      return;
    }
    const space = await prisma.consensusSpace.findUnique({
      where: { id: id.data },
      include: {
        statements: {
          include: { author: { select: { id: true, username: true } } },
        },
        document: true,
      },
    });
    if (!space) {
      res.status(404).json({ error: "Consensus space not found" });
      return;
    }
    res.json({ space });
  } catch (e) {
    next(e);
  }
});

consensusRouter.post("/:id/statement", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid space id" });
      return;
    }
    const parsed = statementSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const space = await prisma.consensusSpace.findUnique({ where: { id: id.data } });
    if (!space) {
      res.status(404).json({ error: "Consensus space not found" });
      return;
    }
    const statement = await prisma.consensusStatement.create({
      data: {
        spaceId: id.data,
        authorId: req.userId!,
        content: parsed.data.content,
        intent: parsed.data.intent,
      },
      include: { author: { select: { id: true, username: true } } },
    });
    res.status(201).json({ statement });
  } catch (e) {
    next(e);
  }
});

consensusRouter.post(
  "/:id/statement/:statementId/vote",
  requireAuth,
  async (req: AuthedRequest, res, next) => {
    try {
      const spaceId = z.string().uuid().safeParse(req.params.id);
      const statementId = z.string().uuid().safeParse(req.params.statementId);
      if (!spaceId.success || !statementId.success) {
        res.status(400).json({ error: "Invalid ids" });
        return;
      }
      const parsed = statementVoteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
        return;
      }
      const statement = await prisma.consensusStatement.findFirst({
        where: { id: statementId.data, spaceId: spaceId.data },
      });
      if (!statement) {
        res.status(404).json({ error: "Statement not found" });
        return;
      }
      if (statement.authorId === req.userId) {
        res.status(403).json({ error: "Cannot vote on your own statement" });
        return;
      }
      const vote = await prisma.statementVote.upsert({
        where: {
          userId_statementId: { userId: req.userId!, statementId: statementId.data },
        },
        create: {
          userId: req.userId!,
          statementId: statementId.data,
          type: parsed.data.type,
        },
        update: { type: parsed.data.type },
      });
      res.json({ vote });
    } catch (e) {
      next(e);
    }
  },
);

consensusRouter.get("/:id/document", async (req, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid space id" });
      return;
    }
    const doc = await prisma.consensusDocument.findFirst({
      where: { spaceId: id.data },
    });
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json({ document: doc });
  } catch (e) {
    next(e);
  }
});
