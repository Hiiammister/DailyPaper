import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { getOrCreateDailyPaper, updateStreak } from "../services/dailyPaper.js";
import { z } from "zod";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  try {
    const daily = await getOrCreateDailyPaper(req.userId!);
    const { quiz: _quiz, ...paperWithoutQuiz } = daily.paper;
    res.json({ ...daily, paper: paperWithoutQuiz });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "NO_TOPICS") {
      res.status(428).json({ error: "NO_TOPICS" });
    } else {
      console.error(err);
      res.status(500).json({ error: "Failed to get daily paper" });
    }
  }
});

router.post("/complete", async (req: AuthRequest, res) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const daily = await prisma.dailyPaper.findUnique({
    where: { userId_date: { userId: req.userId!, date: today } },
  });

  if (!daily) {
    res.status(404).json({ error: "No paper for today" });
    return;
  }

  if (!daily.completed) {
    await prisma.dailyPaper.update({
      where: { id: daily.id },
      data: { completed: true },
    });
  }

  res.json({ ok: true });
});

router.get("/quiz", async (req: AuthRequest, res) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const daily = await prisma.dailyPaper.findUnique({
    where: { userId_date: { userId: req.userId!, date: today } },
    include: { paper: true },
  });

  if (!daily) {
    res.status(404).json({ error: "No paper for today" });
    return;
  }
  if (!daily.completed) {
    res.status(403).json({ error: "Must complete reading first" });
    return;
  }
  if (daily.score !== null) {
    res.status(409).json({ error: "Quiz already submitted" });
    return;
  }

  const quiz = daily.paper.quiz as Array<{ question: string; options: string[]; answer: number }>;
  const sanitized = quiz.map(({ question, options }) => ({ question, options }));
  res.json({ quiz: sanitized });
});

router.post("/quiz/submit", async (req: AuthRequest, res) => {
  const schema = z.object({ answers: z.array(z.number().min(0).max(3)).length(5) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "answers must be an array of 5 numbers (0-3)" });
    return;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const daily = await prisma.dailyPaper.findUnique({
    where: { userId_date: { userId: req.userId!, date: today } },
    include: { paper: true },
  });

  if (!daily) {
    res.status(404).json({ error: "No paper for today" });
    return;
  }
  if (!daily.completed) {
    res.status(403).json({ error: "Must complete reading first" });
    return;
  }
  if (daily.score !== null) {
    res.status(409).json({ error: "Quiz already submitted" });
    return;
  }

  const quiz = daily.paper.quiz as Array<{ answer: number }>;
  const { answers } = parsed.data;
  const score = answers.reduce((acc, ans, i) => acc + (ans === quiz[i].answer ? 1 : 0), 0);

  await prisma.dailyPaper.update({
    where: { id: daily.id },
    data: { score },
  });

  const newStreak = await updateStreak(req.userId!, score);

  res.json({ score, total: 5, passed: score >= 3, newStreak });
});

export default router;
