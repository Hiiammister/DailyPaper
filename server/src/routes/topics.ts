import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

router.get("/", async (_req, res) => {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  res.json(topics);
});

router.put("/me", requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({ topicIds: z.array(z.number()).min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "topicIds must be a non-empty array of numbers" });
    return;
  }

  const { topicIds } = parsed.data;
  const userId = req.userId!;

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: { id: userId, email: "" },
  });

  await prisma.userTopic.deleteMany({ where: { userId } });
  await prisma.userTopic.createMany({
    data: topicIds.map((topicId) => ({ userId, topicId })),
  });

  res.json({ ok: true });
});

export default router;
