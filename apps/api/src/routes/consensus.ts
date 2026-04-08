import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { getIo } from "../realtime/io.js";
import * as notificationService from "../services/notificationService.js";

export const consensusRouter = Router();

const statementSchema = z.object({
  content: z.string().min(1).max(280),
  intent: z.enum(["EXPAND_AGREEMENT", "EXPLORE_DISAGREEMENT"]),
});

const statementVoteSchema = z.object({
  type: z.enum(["AGREE", "DISAGREE", "PARTIALLY", "RELEVANT", "IRRELEVANT", "NEW_TO_ME"]),
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

consensusRouter.post(
  "/:id/statement",
  rateLimit({ windowMs: 10_000, max: 15 }),
  requireAuth,
  async (req: AuthedRequest, res, next) => {
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

    const memberships = await prisma.clusterMembership.findMany({
      where: { clusterId: { in: [space.clusterAId, space.clusterBId] } },
      select: { userId: true },
    });
    const recipients = Array.from(
      new Set<string>(memberships.map((m: { userId: string }) => m.userId)),
    ).filter(
      (userId) => userId !== req.userId,
    );
    const io = getIo();
    await Promise.all(
      recipients.slice(0, 30).map(async (userId) => {
        const n = await notificationService.create(
          userId,
          "Nuevo enunciado en un espacio de consenso",
          "Alguien propuso un enunciado votable en un espacio donde participas.",
        );
        io?.to(`user:${userId}`).emit("notification:new", {
          id: n.id,
          title: n.title,
          body: n.body,
        });
      }),
    );

    res.status(201).json({ statement });
  } catch (e) {
    next(e);
  }
  },
);

consensusRouter.post(
  "/:id/statement/:statementId/vote",
  rateLimit({ windowMs: 10_000, max: 30 }),
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

      const voterCount = await prisma.statementVote.count({
        where: { statementId: statementId.data },
      });
      const io = getIo();
      io?.to(`space:${spaceId.data}`).emit("space:statement_voted", {
        spaceId: spaceId.data,
        statementId: statementId.data,
        voterCount,
      });

      if (statement.authorId) {
        const n = await notificationService.create(
          statement.authorId,
          "Tu enunciado recibió un voto",
          "Alguien reaccionó a tu enunciado en un espacio de consenso.",
        );
        io?.to(`user:${statement.authorId}`).emit("notification:new", {
          id: n.id,
          title: n.title,
          body: n.body,
        });
      }
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
