import { useLocation, useNavigate } from "react-router-dom";
import type { QuizResult } from "../lib/api.ts";
import StreakBadge from "../components/StreakBadge.tsx";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as QuizResult | null;

  if (!result) {
    navigate("/");
    return null;
  }

  const { score, total, passed, newStreak } = result;
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        {/* Emoji */}
        <div className="text-6xl mb-4">{passed ? "🎉" : "📖"}</div>

        {/* Result */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {passed ? "Great job!" : "Keep reading!"}
        </h1>
        <p className="text-gray-500 mb-6">
          {passed
            ? "You passed the quiz and kept your streak alive."
            : "You need 3/5 to pass. Try again tomorrow!"}
        </p>

        {/* Score */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div>
            <p className="text-5xl font-bold text-gray-900">
              {score}
              <span className="text-2xl text-gray-400">/{total}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{percentage}% correct</p>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="flex flex-col items-center">
            <StreakBadge streak={newStreak} size="lg" />
          </div>
        </div>

        {/* Score breakdown */}
        <div className="flex gap-1.5 justify-center mb-8">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-3 flex-1 rounded-full ${
                i < score ? "bg-green-400" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate("/history")}
            className="w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            View Paper History
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
