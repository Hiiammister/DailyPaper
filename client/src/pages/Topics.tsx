import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ChevronDown, Check, ArrowLeft } from "lucide-react";
import { api, type Topic } from "../lib/api.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";

interface Group {
  label: string;
  emoji: string;
  prefixes: string[];
}

const GROUPS: Group[] = [
  {
    label: "Computer Science",
    emoji: "💻",
    prefixes: ["cs."],
  },
  {
    label: "Mathematics",
    emoji: "📐",
    prefixes: ["math.", "math-ph"],
  },
  {
    label: "Statistics",
    emoji: "📊",
    prefixes: ["stat."],
  },
  {
    label: "Physics",
    emoji: "⚛️",
    prefixes: ["quant-ph", "gr-qc", "hep-", "cond-mat.", "physics."],
  },
  {
    label: "Astrophysics",
    emoji: "🔭",
    prefixes: ["astro-ph."],
  },
  {
    label: "Biology",
    emoji: "🧬",
    prefixes: ["q-bio."],
  },
  {
    label: "Electrical Engineering",
    emoji: "⚡",
    prefixes: ["eess."],
  },
  {
    label: "Economics & Finance",
    emoji: "📈",
    prefixes: ["econ.", "q-fin."],
  },
];

function topicGroup(topic: Topic): string {
  for (const group of GROUPS) {
    if (group.prefixes.some((p) => topic.arxivCategory.startsWith(p))) {
      return group.label;
    }
  }
  return "Other";
}

export default function Topics() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["Computer Science"]));

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const [allTopics, user] = await Promise.all([
          api.getTopics(token),
          api.getUser(token),
        ]);
        setTopics(allTopics);
        const userTopicIds = new Set(user.topics.map((t) => t.id));
        setSelected(userTopicIds);

        // Auto-open groups that have selected topics
        const activeGroups = new Set<string>(["Computer Science"]);
        allTopics.forEach((t) => {
          if (userTopicIds.has(t.id)) activeGroups.add(topicGroup(t));
        });
        setOpenGroups(activeGroups);
      } catch {
        setError("Failed to load topics");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  }

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function selectAllInGroup(groupTopics: Topic[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      groupTopics.forEach((t) => next.add(t.id));
      return next;
    });
    setSaved(false);
  }

  function clearAllInGroup(groupTopics: Topic[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      groupTopics.forEach((t) => next.delete(t.id));
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    if (selected.size === 0) return;
    setSaving(true);
    setSaved(false);
    try {
      const token = await getToken();
      if (!token) return;
      await api.saveTopics(token, Array.from(selected));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Failed to save topics");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Build grouped map
  const grouped = new Map<string, Topic[]>();
  for (const group of GROUPS) {
    grouped.set(group.label, []);
  }
  topics.forEach((t) => {
    const g = topicGroup(t);
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(t);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Topics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pick anything you're curious about with papers come from all fields.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-gray-400 dark:text-gray-500">{selected.size} selected</span>
          <button
            onClick={handleSave}
            disabled={selected.size === 0 || saving}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              saved
                ? "bg-green-500 text-white"
                : "bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
            }`}
          >
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

      {/* Groups */}
      <div className="space-y-2">
        {GROUPS.map(({ label, emoji }) => {
          const groupTopics = grouped.get(label) ?? [];
          if (groupTopics.length === 0) return null;
          const isOpen = openGroups.has(label);
          const selectedCount = groupTopics.filter((t) => selected.has(t.id)).length;

          return (
            <div key={label} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(label)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{emoji}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{label}</span>
                  {selectedCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-700 text-brand-700 dark:text-brand-100 font-medium">
                      {selectedCount} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">{groupTopics.length} topics</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Topics grid */}
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex gap-2 mt-3 mb-3">
                    <button
                      onClick={() => selectAllInGroup(groupTopics)}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <button
                      onClick={() => clearAllInGroup(groupTopics)}
                      className="text-xs text-gray-400 dark:text-gray-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {groupTopics.map((topic) => {
                      const active = selected.has(topic.id);
                      return (
                        <button
                          key={topic.id}
                          onClick={() => toggle(topic.id)}
                          className={`px-3 py-2 rounded-lg border-2 text-xs font-medium text-left transition-all ${
                            active
                              ? "border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
                              : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                          }`}
                        >
                          {active && <Check className="inline w-3 h-3 mr-1" />}
                          {topic.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
           Back to home
        </button>
        <button
          onClick={handleSave}
          disabled={selected.size === 0 || saving}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-green-500 text-white"
              : "bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white"
          }`}
        >
          <span className="flex items-center gap-1.5">
            {saving ? "Saving…" : saved ? <><Check className="w-4 h-4" /> Saved</> : `Save ${selected.size} topic${selected.size !== 1 ? "s" : ""}`}
          </span>
        </button>
      </div>
    </div>
  );
}
