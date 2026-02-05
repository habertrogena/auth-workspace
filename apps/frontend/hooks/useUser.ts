
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { User } from "@/interface/user";



export function useUser() {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState<string | null>(null);

  /**
   * Fetch user on demand
   */
  const getUser = useCallback(async (): Promise<User> => {
    try {
      const user = await apiFetch<User>("/auth/me");
      setData(user);
      setIsError(null);
      return user;
    } catch (err: unknown) {
      setData(null);
      const message = err instanceof Error ? err.message : "Failed to fetch user";
      setIsError(message);
      throw err;
    }
  }, []);

  /**
   * Auto-fetch user on mount
   * Avoids synchronous setState in effect body
   */
  useEffect(() => {
    let isMounted = true;

    async function fetchOnMount() {
      try {
        const user = await getUser();
        if (isMounted) setData(user);
      } catch {
        if (isMounted) setData(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOnMount();

    return () => {
      isMounted = false;
    };
  }, [getUser]);

  return { data, isLoading, isError, getUser };
}
