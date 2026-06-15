import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const topics = [
  // ── Computer Science ──────────────────────────────────────────────
  { name: "Machine Learning", arxivCategory: "cs.LG" },
  { name: "Computer Vision", arxivCategory: "cs.CV" },
  { name: "Natural Language Processing", arxivCategory: "cs.CL" },
  { name: "Artificial Intelligence", arxivCategory: "cs.AI" },
  { name: "Neural & Evolutionary Computing", arxivCategory: "cs.NE" },
  { name: "Multiagent Systems", arxivCategory: "cs.MA" },
  { name: "Systems & Control", arxivCategory: "cs.SY" },
  { name: "Distributed Systems", arxivCategory: "cs.DC" },
  { name: "Computer Networks", arxivCategory: "cs.NI" },
  { name: "Operating Systems", arxivCategory: "cs.OS" },
  { name: "Computer Architecture", arxivCategory: "cs.AR" },
  { name: "Performance", arxivCategory: "cs.PF" },
  { name: "Algorithms & Data Structures", arxivCategory: "cs.DS" },
  { name: "Computational Complexity", arxivCategory: "cs.CC" },
  { name: "Information Theory", arxivCategory: "cs.IT" },
  { name: "Logic in Computer Science", arxivCategory: "cs.LO" },
  { name: "Discrete Mathematics", arxivCategory: "cs.DM" },
  { name: "Computational Geometry", arxivCategory: "cs.CG" },
  { name: "Game Theory & CS", arxivCategory: "cs.GT" },
  { name: "Programming Languages", arxivCategory: "cs.PL" },
  { name: "Software Engineering", arxivCategory: "cs.SE" },
  { name: "Databases", arxivCategory: "cs.DB" },
  { name: "Information Retrieval", arxivCategory: "cs.IR" },
  { name: "Social & Information Networks", arxivCategory: "cs.SI" },
  { name: "Digital Libraries", arxivCategory: "cs.DL" },
  { name: "Cryptography & Security", arxivCategory: "cs.CR" },
  { name: "Human-Computer Interaction", arxivCategory: "cs.HC" },
  { name: "Computers & Society", arxivCategory: "cs.CY" },
  { name: "Multimedia", arxivCategory: "cs.MM" },
  { name: "Sound & Audio", arxivCategory: "cs.SD" },
  { name: "Robotics", arxivCategory: "cs.RO" },
  { name: "Computer Graphics", arxivCategory: "cs.GR" },
  { name: "Emerging Technologies", arxivCategory: "cs.ET" },
  { name: "Symbolic Computation", arxivCategory: "cs.SC" },

  // ── Mathematics ───────────────────────────────────────────────────
  { name: "Combinatorics", arxivCategory: "math.CO" },
  { name: "Number Theory", arxivCategory: "math.NT" },
  { name: "Probability", arxivCategory: "math.PR" },
  { name: "Optimization & Control", arxivCategory: "math.OC" },
  { name: "Numerical Analysis", arxivCategory: "math.NA" },
  { name: "Algebraic Geometry", arxivCategory: "math.AG" },
  { name: "Algebraic Topology", arxivCategory: "math.AT" },
  { name: "Analysis of PDEs", arxivCategory: "math.AP" },
  { name: "Statistics Theory", arxivCategory: "math.ST" },
  { name: "Dynamical Systems", arxivCategory: "math.DS" },
  { name: "Functional Analysis", arxivCategory: "math.FA" },
  { name: "Mathematical Physics", arxivCategory: "math-ph" },

  // ── Statistics ────────────────────────────────────────────────────
  { name: "Statistical Machine Learning", arxivCategory: "stat.ML" },
  { name: "Statistical Methodology", arxivCategory: "stat.ME" },
  { name: "Applied Statistics", arxivCategory: "stat.AP" },
  { name: "Statistical Computation", arxivCategory: "stat.CO" },

  // ── Physics ───────────────────────────────────────────────────────
  { name: "Quantum Physics", arxivCategory: "quant-ph" },
  { name: "General Relativity", arxivCategory: "gr-qc" },
  { name: "High Energy Physics", arxivCategory: "hep-th" },
  { name: "Condensed Matter Physics", arxivCategory: "cond-mat.mes-hall" },
  { name: "Materials Science", arxivCategory: "cond-mat.mtrl-sci" },
  { name: "Fluid Dynamics", arxivCategory: "physics.flu-dyn" },
  { name: "Computational Physics", arxivCategory: "physics.comp-ph" },
  { name: "Medical Physics", arxivCategory: "physics.med-ph" },
  { name: "Plasma Physics", arxivCategory: "physics.plasm-ph" },
  { name: "Optics", arxivCategory: "physics.optics" },

  // ── Astrophysics ──────────────────────────────────────────────────
  { name: "Astrophysics of Galaxies", arxivCategory: "astro-ph.GA" },
  { name: "Cosmology", arxivCategory: "astro-ph.CO" },
  { name: "Earth & Planetary Science", arxivCategory: "astro-ph.EP" },
  { name: "Solar & Stellar Astrophysics", arxivCategory: "astro-ph.SR" },
  { name: "High Energy Astrophysics", arxivCategory: "astro-ph.HE" },

  // ── Biology ───────────────────────────────────────────────────────
  { name: "Genomics", arxivCategory: "q-bio.GN" },
  { name: "Neurons & Cognition", arxivCategory: "q-bio.NC" },
  { name: "Biomolecules", arxivCategory: "q-bio.BM" },
  { name: "Populations & Evolution", arxivCategory: "q-bio.PE" },
  { name: "Cell Behavior", arxivCategory: "q-bio.CB" },
  { name: "Molecular Networks", arxivCategory: "q-bio.MN" },
  { name: "Quantitative Biology Methods", arxivCategory: "q-bio.QM" },

  // ── Electrical Engineering ────────────────────────────────────────
  { name: "Signal Processing", arxivCategory: "eess.SP" },
  { name: "Image & Video Processing", arxivCategory: "eess.IV" },
  { name: "Audio & Speech Processing", arxivCategory: "eess.AS" },
  { name: "Electrical Systems & Control", arxivCategory: "eess.SY" },

  // ── Economics & Finance ───────────────────────────────────────────
  { name: "Econometrics", arxivCategory: "econ.EM" },
  { name: "Theoretical Economics", arxivCategory: "econ.TH" },
  { name: "General Economics", arxivCategory: "econ.GN" },
  { name: "Risk Management", arxivCategory: "q-fin.RM" },
  { name: "Portfolio Management", arxivCategory: "q-fin.PM" },
  { name: "Trading & Market Microstructure", arxivCategory: "q-fin.TR" },
  { name: "Computational Finance", arxivCategory: "q-fin.CP" },
];

async function main() {
  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: { arxivCategory: topic.arxivCategory },
      create: topic,
    });
  }
  console.log(`Seeded ${topics.length} topics.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
