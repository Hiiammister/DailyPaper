import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api, type DailyPaperResponse } from "../lib/api.ts";

function todayLocalString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function msUntilLocalMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // next local midnight
  return midnight.getTime() - now.getTime();
}

export function useDaily() {
  const { getToken } = useAuth();
  const [daily, setDaily] = useState<DailyPaperResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noTopics, setNoTopics] = useState(false);
  const loadedOnDate = useRef<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const data = await api.getDaily(token);
      setDaily(data);
      setError(null);
      setNoTopics(false);
      loadedOnDate.current = todayLocalString();
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 428) {
        setNoTopics(true);
      } else {
        setError(e.message ?? "Failed to load daily paper");
      }
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  // Initial load
  useEffect(() => {
    load();
  }, [load]);

  // Refresh at UTC midnight
  useEffect(() => {
    const ms = msUntilLocalMidnight();
    const timer = setTimeout(() => {
      load();
    }, ms);
    return () => clearTimeout(timer);
  }, [load, daily]); // re-schedule after each load

  // Refresh when user returns to the tab after midnight
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        const today = todayLocalString();
        if (loadedOnDate.current && loadedOnDate.current !== today) {
          load();
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [load]);

  return { daily, loading, error, noTopics, setDaily };
}
