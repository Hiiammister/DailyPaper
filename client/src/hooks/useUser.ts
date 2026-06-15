import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api, type UserProfile } from "../lib/api.ts";

export function useUserProfile() {
  const { getToken } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const data = await api.getUser(token);
      setUser(data);
      setError(null);
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 404) {
        setUser(null);
      } else {
        setError(e.message ?? "Failed to load user");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { user, loading, error, refetch };
}
