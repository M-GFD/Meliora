import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

export const usersRouter = Router();

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const userId = z.string().uuid().safeParse(req.params.userId);
    if (!userId.success) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId.data },
      select: { id: true, username: true, createdAt: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user });
  } catch (e) {
    next(e);
  }
});
