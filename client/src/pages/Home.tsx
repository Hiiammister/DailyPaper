import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api.ts";
import { useDaily } from "../hooks/useDaily.ts";
import { useUserProfile } from "../hooks/useUser.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import StreakBadge from "../components/StreakBadge.tsx";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { daily, loading, error, noTopics } = useDaily();
  const { user } = useUserProfile();
  const [completing, setCompleting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500 text-sm">Fetching your paper for today…</p>
        </div>
      </div>
    );
  }

  if (noTopics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">📚</p>
          <h2 className="text-xl font-semibold mb-2">Choose your topics first</h2>
          <p className="text-gray-500 mb-6">
            Tell us what you're interested in and we'll find you a great paper.
          </p>
          <button
            onClick={() => navigate("/onboarding")}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
          >
            Pick Topics
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!daily) return null;

  const alreadyDone = daily.score !== null;
  const awaitingQuiz = daily.completed && daily.score === null;

  async function handleDone() {
    setCompleting(true);
    try {
      const token = await getToken();
      if (!token) return;
      await api.completeReading(token);
      navigate("/quiz");
    } catch {
      navigate("/quiz");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">
            {new Date(daily.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="text-xl font-semibold text-gray-900">Today's Paper</h1>
        </div>
        {user && <StreakBadge streak={user.streak} size="lg" />}
      </div>

      {/* Paper card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 leading-snug mb-3">
            {daily.paper.title}
          </h2>
          <p className="text-sm text-gray-500">
            {daily.paper.authors.slice(0, 3).join(", ")}
            {daily.paper.authors.length > 3 && ` +${daily.paper.authors.length - 3} more`}
          </p>
          <a
            href={daily.paper.arxivUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-brand-600 hover:underline"
          >
            View on arXiv ↗
          </a>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
            Summary
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-3">
            {daily.paper.summary.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {alreadyDone ? (
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
          <span className="text-green-600 font-medium">
            ✓ Completed today — Score: {daily.score}/5
          </span>
          <button
            onClick={() => navigate("/history")}
            className="text-sm text-brand-600 hover:underline"
          >
            View history
          </button>
        </div>
      ) : awaitingQuiz ? (
        <button
          onClick={() => navigate("/quiz")}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          Take the Quiz →
        </button>
      ) : (
        <button
          onClick={handleDone}
          disabled={completing}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          {completing ? "Loading quiz…" : "I'm Done Reading →"}
        </button>
      )}
    </div>
  );
}
