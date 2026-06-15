import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { api, type Topic } from "../lib/api.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";

export default function Onboarding() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.getTopics(token);
        setTopics(data);
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
  }

  async function handleSave() {
    if (selected.size === 0) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.saveTopics(token, Array.from(selected));
      navigate("/");
    } catch {
      setError("Failed to save topics");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          What do you want to learn?
        </h1>
        <p className="text-gray-500">
          Pick at least one topic. We'll surface one paper per day from these areas.
        </p>
      </div>

      {error && (
        <p className="text-red-500 text-center mb-4">{error}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {topics.map((topic) => {
          const active = selected.has(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => toggle(topic.id)}
              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                active
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {topic.name}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSave}
          disabled={selected.size === 0 || saving}
          className="px-8 py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? "Saving..." : `Continue with ${selected.size} topic${selected.size !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
