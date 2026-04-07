import { Router } from "express";
import { z } from "zod";
import { VoteType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const postsRouter = Router();

const createPostSchema = z.object({
  content: z.string().min(1).max(280),
  topicId: z.string().uuid().optional(),
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
    res.json({ posts });
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

const voteSchema = z.object({
  type: z.nativeEnum(VoteType),
});

postsRouter.post("/:id/vote", requireAuth, async (req: AuthedRequest, res, next) => {
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
    res.json({ vote });
  } catch (e) {
    next(e);
  }
});
