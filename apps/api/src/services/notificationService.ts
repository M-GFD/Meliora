import { prisma } from "../lib/prisma.js";

export async function listForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function markRead(userId: string, notificationId: string) {
  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
  return updated.count > 0;
}
