import { BookOpen, Lightbulb, Target, Layers, MessageSquare, RefreshCw, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Section {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
}

function Accordion({ title, icon, content }: { title: string; icon: React.ReactNode; content: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-brand-500">{icon}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
}

const SECTIONS: Section[] = [
  {
    icon: <Target className="w-5 h-5" />,
    title: "Step 1 — Read the Abstract first",
    content: (
      <div className="space-y-2">
        <p>The abstract is a 150–250 word summary of the entire paper. Before anything else, read it carefully. Ask yourself:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>What problem are they solving?</li>
          <li>What is their proposed solution?</li>
          <li>What did they find or achieve?</li>
        </ul>
        <p className="mt-2">If you can't answer these after reading the abstract, read it again. This determines whether the paper is even worth your time.</p>
      </div>
    ),
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "Step 2 — Skim the structure before deep reading",
    content: (
      <div className="space-y-2">
        <p>Before reading every word, scan the full paper in 5 minutes:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Read all section headings</li>
          <li>Look at every figure and table — read their captions</li>
          <li>Read the introduction's first and last paragraph</li>
          <li>Read the conclusion</li>
        </ul>
        <p className="mt-2">This gives you a mental map so deep reading feels like filling in blanks, not exploring an unknown territory.</p>
      </div>
    ),
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Step 3 — Read Introduction & Related Work",
    content: (
      <div className="space-y-2">
        <p>The <strong>Introduction</strong> tells you why the problem matters, what prior work missed, and what this paper contributes. Read it carefully.</p>
        <p className="mt-2">The <strong>Related Work</strong> section gives context. You don't need to know every cited paper — just understand how this work differs from what came before.</p>
        <p className="mt-2 text-amber-600 dark:text-amber-400 font-medium">💡 Tip: The last paragraph of the introduction usually lists the paper's contributions as bullet points. This is gold.</p>
      </div>
    ),
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: "Step 4 — Understand the Method",
    content: (
      <div className="space-y-2">
        <p>This is usually the hardest section. Key strategies:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Focus on the figures — most methods are visualized</li>
          <li>Look for the main equation or algorithm box</li>
          <li>Don't get stuck on every math detail on first pass</li>
          <li>Ask: <em>"What goes in, what comes out, and what does the model do in the middle?"</em></li>
        </ul>
        <p className="mt-2">It's okay to not understand 100% of the method. Understanding 70% is enough to follow the results.</p>
      </div>
    ),
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Step 5 — Study the Results & Experiments",
    content: (
      <div className="space-y-2">
        <p>This is where the paper proves its claims. Focus on:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li><strong>Baselines:</strong> What are they comparing against?</li>
          <li><strong>Metrics:</strong> What does "better" mean here?</li>
          <li><strong>Tables:</strong> Which numbers matter most — look at bold values</li>
          <li><strong>Ablations:</strong> What happens when they remove components? This reveals what actually works</li>
        </ul>
        <p className="mt-2 text-amber-600 dark:text-amber-400 font-medium">💡 Tip: A strong paper shows results on multiple datasets and includes ablation studies.</p>
      </div>
    ),
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Step 6 — Read the Discussion & Conclusion",
    content: (
      <div className="space-y-2">
        <p>The conclusion summarizes contributions and often mentions limitations. The discussion (when present) is where authors are most honest about what didn't work.</p>
        <p className="mt-2">Ask yourself after reading:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Did they actually prove what they claimed?</li>
          <li>What assumptions did they make?</li>
          <li>What would the next logical experiment be?</li>
        </ul>
      </div>
    ),
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Step 7 — Take notes in your own words",
    content: (
      <div className="space-y-2">
        <p>After reading, write a 3–5 sentence summary in plain English without looking at the paper. This forces you to actually understand it rather than just recognize words.</p>
        <p className="mt-2">A good summary answers:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>What problem did they solve?</li>
          <li>How did they solve it?</li>
          <li>Did it work? How well?</li>
          <li>What's still unsolved?</li>
        </ul>
        <p className="mt-2 text-brand-600 dark:text-brand-400 font-medium">This is exactly what DailyPaper's AI summary does — but try doing it yourself first.</p>
      </div>
    ),
  },
];

const TIPS = [
  { emoji: "⏱️", text: "A paper takes 1–3 hours to read well. Don't try to rush it." },
  { emoji: "📖", text: "Read the same paper multiple times — each pass reveals more depth." },
  { emoji: "🔍", text: "If you don't understand a term, Google it before moving on." },
  { emoji: "🗂️", text: "Use a reference manager (Zotero, Mendeley) to save papers you want to revisit." },
  { emoji: "🤝", text: "Discuss papers with others. Explaining it out loud is the best test of understanding." },
  { emoji: "🧪", text: "For systems papers, try to reproduce a result — even a small one." },
];

export default function Resources() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">How to Read a Research Paper</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          A practical guide for CS students reading their first (or fiftieth) paper.
        </p>
      </div>

      {/* The 3-pass method callout */}
      <div className="bg-brand-50 dark:bg-gray-800 border border-brand-100 dark:border-gray-700 rounded-xl p-5 mb-8">
        <h2 className="font-semibold text-brand-700 dark:text-brand-500 mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          The 3-Pass Method
        </h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          Most researchers use a <strong>3-pass approach</strong>: first a quick skim (5 min) to decide if it's worth reading,
          then a careful read ignoring proofs (1 hr) to grasp the main ideas,
          then a deep read reconstructing every detail (4–5 hrs) to truly understand and critique the work.
          For DailyPaper, aim for passes 1 and 2.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-10">
        {SECTIONS.map((s) => (
          <Accordion key={s.title} title={s.title} icon={s.icon} content={s.content} />
        ))}
      </div>

      {/* Quick tips */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
          Quick Tips
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIPS.map((tip) => (
            <div
              key={tip.text}
              className="flex items-start gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl"
            >
              <span className="text-xl shrink-0">{tip.emoji}</span>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
