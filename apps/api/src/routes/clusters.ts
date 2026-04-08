import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { requestClusterRun } from "../services/clusterService.js";
import { getIo } from "../realtime/io.js";

export const clustersRouter = Router();

clustersRouter.get("/", async (_req, res, next) => {
  try {
    const clusters = await prisma.cluster.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });
    res.json({ clusters });
  } catch (e) {
    next(e);
  }
});

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

clustersRouter.post("/run", requireAuth, async (_req: AuthedRequest, res, next) => {
  try {
    const votes = await prisma.vote.findMany({
      select: { userId: true, postId: true, type: true },
    });
    const result = await requestClusterRun(votes);

    const parsed = z
      .object({
        clusters: z.array(
          z.object({
            id: z.string().uuid().optional(),
            vectorSignature: z.unknown(),
            members: z.array(z.object({ userId: z.string().uuid(), weight: z.number() })),
          }),
        ),
      })
      .passthrough()
      .safeParse(result);

    if (!parsed.success) {
      res.status(502).json({ error: "Invalid ML clustering response" });
      return;
    }

    const io = getIo();
    const affectedUsers = new Map<string, Set<string>>();

    for (const c of parsed.data.clusters) {
      const cluster =
        c.id !== undefined
          ? await prisma.cluster.upsert({
              where: { id: c.id },
              create: { id: c.id, vectorSignature: c.vectorSignature as never },
              update: { vectorSignature: c.vectorSignature as never },
            })
          : await prisma.cluster.create({
              data: { vectorSignature: c.vectorSignature as never },
            });

      for (const m of c.members) {
        await prisma.clusterMembership.upsert({
          where: { userId_clusterId: { userId: m.userId, clusterId: cluster.id } },
          create: { userId: m.userId, clusterId: cluster.id, weight: m.weight },
          update: { weight: m.weight },
        });
        if (!affectedUsers.has(m.userId)) {
          affectedUsers.set(m.userId, new Set());
        }
        affectedUsers.get(m.userId)!.add(cluster.id);
      }
    }

    for (const [userId, clusterIds] of affectedUsers) {
      io?.to(`user:${userId}`).emit("cluster:updated", {
        userId,
        clusterIds: Array.from(clusterIds),
      });
    }

    res.json({ ok: true, clusters: parsed.data.clusters.length });
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
