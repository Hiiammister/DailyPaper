import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api, type DailyPaperRecord } from "../lib/api.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
        No quiz
      </span>
    );
  }
  const passed = score >= 3;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      {score}/5 {passed ? "✓" : "✗"}
    </span>
  );
}

export default function History() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState<DailyPaperRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.getHistory(token);
        setHistory(data);
      } catch {
        setError("Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paper History</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {history.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>No papers read yet. Start with today's paper!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-gray-400">
                    {new Date(record.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <ScoreBadge score={record.score} />
                </div>
                <p className="text-sm font-medium text-gray-900 leading-snug truncate">
                  {record.paper.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {record.paper.authors.slice(0, 2).join(", ")}
                  {record.paper.authors.length > 2 && " et al."}
                </p>
              </div>
              <a
                href={record.paper.arxivUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline whitespace-nowrap mt-0.5"
              >
                arXiv ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
