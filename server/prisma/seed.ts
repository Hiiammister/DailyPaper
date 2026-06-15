import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const topics = [
  { name: "Machine Learning", arxivCategory: "cs.LG" },
  { name: "Computer Vision", arxivCategory: "cs.CV" },
  { name: "Natural Language Processing", arxivCategory: "cs.CL" },
  { name: "Systems", arxivCategory: "cs.SY" },
  { name: "Algorithms", arxivCategory: "cs.DS" },
  { name: "Distributed Systems", arxivCategory: "cs.DC" },
  { name: "Computer Networks", arxivCategory: "cs.NI" },
  { name: "Databases", arxivCategory: "cs.DB" },
  { name: "Robotics", arxivCategory: "cs.RO" },
  { name: "Human-Computer Interaction", arxivCategory: "cs.HC" },
  { name: "Cryptography & Security", arxivCategory: "cs.CR" },
  { name: "Programming Languages", arxivCategory: "cs.PL" },
];

async function main() {
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: {},
      create: topic,
    });
  }
  console.log("Seeded topics.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
