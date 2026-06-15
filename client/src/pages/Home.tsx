import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { BookOpen, CheckCircle, ArrowRight, ExternalLink, Download, GraduationCap, X } from "lucide-react";
import { api } from "../lib/api.ts";
import { useDaily } from "../hooks/useDaily.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { daily, loading, error, noTopics } = useDaily();
  const [completing, setCompleting] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(
    () => localStorage.getItem("guide-tip-dismissed") === "true"
  );

  function dismissTip() {
    localStorage.setItem("guide-tip-dismissed", "true");
    setTipDismissed(true);
  }

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
          <BookOpen className="w-12 h-12 text-brand-400 mx-auto mb-4" />
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
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {(() => {
            // Prisma returns DATE as "YYYY-MM-DDT00:00:00.000Z" (UTC midnight).
            // Parsing that directly gives the previous day in negative-offset timezones.
            // Slice the date part and build a local Date instead.
            const s = (daily.date as string).slice(0, 10);
            const [y, mo, d] = s.split("-").map(Number);
            return new Date(y, mo - 1, d).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            });
          })()}
        </p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Paper</h1>
      </div>

      {/* Guide tip */}
      {!tipDismissed && (
        <div className="flex items-center gap-3 px-4 py-3 mb-5 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
          <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
            New to reading research papers?{" "}
            <a href="/resources" className="font-semibold underline underline-offset-2 hover:no-underline">
              Check out our guide
            </a>{" "}
            to get the most out of DailyPaper.
          </p>
          <button
            onClick={dismissTip}
            className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Paper card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug mb-3">
            {daily.paper.title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {daily.paper.authors.slice(0, 3).join(", ")}
            {daily.paper.authors.length > 3 && ` +${daily.paper.authors.length - 3} more`}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Published{" "}
              {new Date(daily.paper.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-gray-200 dark:text-gray-700">·</span>
            <a
              href={daily.paper.arxivUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              View on arXiv <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-200 dark:text-gray-700">·</span>
            <a
              href={daily.paper.arxivUrl.replace("/abs/", "/pdf/")}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
            >
              Download PDF <Download className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Summary
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
            {daily.paper.summary.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {alreadyDone ? (
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-900">
          <span className="text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Completed today — Score: {daily.score}/5
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
          Take the Quiz <ArrowRight className="inline w-5 h-5 ml-1" />
        </button>
      ) : (
        <button
          onClick={handleDone}
          disabled={completing}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors text-lg"
        >
          {completing ? "Loading quiz…" : <span className="flex items-center justify-center gap-2">I'm Done Reading <ArrowRight className="w-5 h-5" /></span>}
        </button>
      )}
    </div>
  );
}
