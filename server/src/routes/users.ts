import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

const router = Router();
router.use(requireAuth);

router.get("/me", async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    include: { topics: { include: { topic: true } } },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    email: user.email,
    streak: user.streak,
    lastActive: user.lastActive,
    topics: user.topics.map((ut) => ut.topic),
  });
});

router.get("/me/history", async (req: AuthRequest, res) => {
  const history = await prisma.dailyPaper.findMany({
    where: { userId: req.userId! },
    include: {
      paper: {
        select: { id: true, title: true, authors: true, arxivUrl: true, topicId: true },
      },
    },
    orderBy: { date: "desc" },
    take: 30,
  });
  res.json(history);
});

export default router;
