import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const clustersRouter = Router();

clustersRouter.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const memberships = await prisma.clusterMembership.findMany({
      where: { userId: req.userId! },
      include: { cluster: true },
      orderBy: { weight: "desc" },
    });
    res.json({ memberships });
  } catch (e) {
    next(e);
  }
});

clustersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid cluster id" });
      return;
    }
    const cluster = await prisma.cluster.findUnique({ where: { id: id.data } });
    if (!cluster) {
      res.status(404).json({ error: "Cluster not found" });
      return;
    }
    res.json({ cluster });
  } catch (e) {
    next(e);
  }
});

clustersRouter.get("/:id/posts", async (req, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid cluster id" });
      return;
    }
    const cluster = await prisma.cluster.findUnique({ where: { id: id.data } });
    if (!cluster) {
      res.status(404).json({ error: "Cluster not found" });
      return;
    }
    // Placeholder: en producción filtrar por posts relevantes para el cluster vía ML / agregados.
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { author: { select: { id: true, username: true } } },
    });
    res.json({ posts });
  } catch (e) {
    next(e);
  }
});
