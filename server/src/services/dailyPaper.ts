import { prisma } from "../lib/prisma.js";
import { fetchRecentPapers } from "./arxiv.js";
import { generateSummaryAndQuiz } from "./ai.js";

export async function getOrCreateDailyPaper(userId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.dailyPaper.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { paper: true },
  });
  if (existing) return existing;

  const userTopics = await prisma.userTopic.findMany({
    where: { userId },
    include: { topic: true },
  });
  if (userTopics.length === 0) throw new Error("NO_TOPICS");

  const randomTopic = userTopics[Math.floor(Math.random() * userTopics.length)].topic;

  const arxivPapers = await fetchRecentPapers(randomTopic.arxivCategory, 30);
  if (arxivPapers.length === 0) throw new Error("No papers found");

  const shownPaperIds = await prisma.dailyPaper.findMany({
    where: { userId },
    select: { paperId: true },
  });
  const shownIds = new Set(shownPaperIds.map((p) => p.paperId));

  const unseen = arxivPapers.filter((p) => !shownIds.has(p.id));
  const candidate = unseen.length > 0 ? unseen[0] : arxivPapers[0];

  let paper = await prisma.paper.findUnique({ where: { id: candidate.id } });

  if (!paper) {
    const content = await generateSummaryAndQuiz(candidate.title, candidate.abstract);

    paper = await prisma.paper.upsert({
      where: { id: candidate.id },
      update: {},
      create: {
        id: candidate.id,
        title: candidate.title,
        authors: candidate.authors,
        abstract: candidate.abstract,
        arxivUrl: candidate.arxivUrl,
        publishedAt: candidate.publishedAt,
        summary: content.summary,
        quiz: content.quiz as unknown as import("@prisma/client").Prisma.InputJsonValue,
        topicId: randomTopic.id,
      },
    });
  }

  const dailyPaper = await prisma.dailyPaper.upsert({
    where: { userId_date: { userId, date: today } },
    update: { paperId: paper.id },
    create: { userId, paperId: paper.id, date: today },
    include: { paper: true },
  });

  return dailyPaper;
}

export async function updateStreak(userId: string, score: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = user.streak;

  if (score >= 3) {
    const yesterdayPaper = await prisma.dailyPaper.findFirst({
      where: { userId, date: yesterday, score: { gte: 3 } },
    });

    if (user.streak === 0 || yesterdayPaper) {
      newStreak = user.streak + 1;
    } else {
      const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
      if (lastActiveDate) {
        lastActiveDate.setUTCHours(0, 0, 0, 0);
        if (lastActiveDate.getTime() === today.getTime()) {
          // Already updated today, keep streak
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastActive: new Date() },
  });

  return newStreak;
}
