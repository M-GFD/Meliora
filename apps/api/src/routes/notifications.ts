import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import * as notificationService from "../services/notificationService.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const items = await notificationService.listForUser(req.userId!);
    res.json({ notifications: items });
  } catch (e) {
    next(e);
  }
});

notificationsRouter.patch("/:id/read", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const id = z.string().uuid().safeParse(req.params.id);
    if (!id.success) {
      res.status(400).json({ error: "Invalid notification id" });
      return;
    }
    const ok = await notificationService.markRead(req.userId!, id.data);
    if (!ok) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
