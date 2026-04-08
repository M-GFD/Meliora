import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { getIo } from "../realtime/io.js";
import { checkTransversalConsensus } from "../services/consensusService.js";

export const postsRouter = Router();

const createPostSchema = z.object({
  content: z.string().min(1).max(280),
  topicId: z.string().uuid().optional(),
});

const voteSchema = z.object({
  type: z.enum(["AGREE", "DISAGREE", "PARTIALLY", "RELEVANT", "IRRELEVANT", "NEW_TO_ME"]),
});

postsRouter.get("/feed", async (_req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        author: { select: { id: true, username: true } },
        topic: true,
      },
    });
    const spaces = await prisma.consensusSpace.findMany({
      where: {
        anchorPostId: { in: posts.map((p: { id: string }) => p.id) },
        status: { in: ["ACTIVE", "MATURE"] },
      },
      select: { id: true, anchorPostId: true, status: true },
    });

    const byAnchor = new Map(
      spaces.map((s: { anchorPostId: string; id: string; status: "ACTIVE" | "MATURE" }) => [
        s.anchorPostId,
        s,
      ]),
    );
    res.json({
      posts: posts.map((post: { id: string }) => ({
        ...post,
        consensusSpace: byAnchor.get(post.id) ?? null,
      })),
    });
  } catch (e) {
    next(e);
  }
});

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid post id" });
      return;
    }
    const post = await prisma.post.findUnique({
      where: { id: id.data },
      include: {
        author: { select: { id: true, username: true } },
        topic: true,
      },
    });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json({ post });
  } catch (e) {
    next(e);
  }
});

postsRouter.post("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const post = await prisma.post.create({
      data: {
        content: parsed.data.content,
        authorId: req.userId!,
        topicId: parsed.data.topicId,
      },
      include: {
        author: { select: { id: true, username: true } },
        topic: true,
      },
    });
    res.status(201).json({ post });
  } catch (e) {
    next(e);
  }
});

postsRouter.post(
  "/:id/vote",
  rateLimit({ windowMs: 10_000, max: 40 }),
  requireAuth,
  async (req: AuthedRequest, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid post id" });
      return;
    }
    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const post = await prisma.post.findUnique({ where: { id: id.data } });
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    if (post.authorId === req.userId) {
      res.status(403).json({ error: "Cannot vote on your own post" });
      return;
    }
    const vote = await prisma.vote.upsert({
      where: {
        userId_postId: { userId: req.userId!, postId: id.data },
      },
      create: {
        userId: req.userId!,
        postId: id.data,
        type: parsed.data.type,
      },
      update: { type: parsed.data.type },
    });

    // Puente hacia ML: chequeo de consenso transversal / apertura de espacio.
    try {
      const votesByType = await prisma.vote.groupBy({
        by: ["type"],
        where: { postId: id.data },
        _count: { _all: true },
      });
      const payload = {
        postId: id.data,
        votes: votesByType.map((v: { type: string; _count: { _all: number } }) => ({
          type: v.type,
          count: v._count._all,
        })),
      };
      const result = await checkTransversalConsensus(payload);

      const parsedResult = z
        .object({
          consensusReached: z.boolean().optional(),
          clusterCount: z.number().int().optional(),
          openSpace: z
            .object({
              clusterAId: z.string().uuid(),
              clusterBId: z.string().uuid(),
            })
            .optional(),
        })
        .passthrough()
        .safeParse(result);

      if (parsedResult.success) {
        const io = getIo();
        if (parsedResult.data.consensusReached) {
          io?.emit("post:consensus_reached", {
            postId: id.data,
            clusterCount: parsedResult.data.clusterCount ?? 0,
          });
        }

        if (parsedResult.data.openSpace) {
          const existing = await prisma.consensusSpace.findFirst({
            where: { anchorPostId: id.data, status: { in: ["ACTIVE", "MATURE"] } },
            select: { id: true },
          });
          if (!existing) {
            const space = await prisma.consensusSpace.create({
              data: {
                anchorPostId: id.data,
                clusterAId: parsedResult.data.openSpace.clusterAId,
                clusterBId: parsedResult.data.openSpace.clusterBId,
                status: "ACTIVE",
              },
            });
            io?.emit("space:opened", { spaceId: space.id, anchorPostId: id.data });
          }
        }
      }
    } catch {
      // Si el servicio ML falla, no bloqueamos el voto.
    }
    res.json({ vote });
  } catch (e) {
    next(e);
  }
  },
);
