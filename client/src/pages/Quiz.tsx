import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ChevronLeft, ChevronRight, CheckSquare } from "lucide-react";
import { api, type QuizQuestion } from "../lib/api.ts";
import LoadingSpinner from "../components/LoadingSpinner.tsx";

export default function Quiz() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(5).fill(null));
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.getQuiz(token);
        setQuestions(data.quiz);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        if (e.status === 409) {
          navigate("/result");
        } else if (e.status === 403) {
          navigate("/");
        } else {
          setError(e.message ?? "Failed to load quiz");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function selectAnswer(optionIndex: number) {
    const next = [...answers];
    next[current] = optionIndex;
    setAnswers(next);
  }

  function goNext() {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  }

  function goPrev() {
    if (current > 0) setCurrent(current - 1);
  }

  async function handleSubmit() {
    if (answers.some((a) => a === null)) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) return;
      const result = await api.submitQuiz(token, answers as number[]);
      navigate("/result", { state: result });
    } catch {
      setError("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate("/")} className="text-brand-600 hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const answered = answers[current];
  const allAnswered = answers.every((a) => a !== null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Question {current + 1} of {questions.length}</span>
          <span>{answers.filter((a) => a !== null).length} answered</span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>
        {/* Dot nav */}
        <div className="flex gap-2 mt-3 justify-center">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current
                  ? "bg-brand-500 w-5"
                  : answers[i] !== null
                  ? "bg-brand-300"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-6">
          {q.question}
        </p>
        <div className="space-y-3">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                answered === i
                  ? "border-brand-500 bg-brand-50 text-brand-800 font-medium"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="inline-block w-6 font-medium text-gray-400 dark:text-gray-500 shrink-0">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {current < questions.length - 1 ? (
          <button
            onClick={goNext}
            disabled={answered === null}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            {submitting ? "Submitting…" : "Submit Answers"}
          </button>
        )}
      </div>
    </div>
  );
}
