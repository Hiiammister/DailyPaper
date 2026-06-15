import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api, type DailyPaperResponse } from "../lib/api.ts";

export function useDaily() {
  const { getToken } = useAuth();
  const [daily, setDaily] = useState<DailyPaperResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noTopics, setNoTopics] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await api.getDaily(token);
        setDaily(data);
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
    }
    load();
  }, []);

  return { daily, loading, error, noTopics, setDaily };
}
