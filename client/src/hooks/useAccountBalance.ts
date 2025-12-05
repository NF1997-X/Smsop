import { useQuery } from "@tanstack/react-query";

interface BalanceResponse {
  success: boolean;
  quotaRemaining?: number;
  balance?: string;
  message?: string;
}

export function useAccountBalance() {
  const { data, isLoading, error, refetch } = useQuery<BalanceResponse>({
    queryKey: ["/api/account/balance"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (reduce rate limit hits)
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    retry: false, // Don't retry on failure (avoid rate limiting)
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  return {
    balance: data?.balance ?? null,
    quotaRemaining: data?.quotaRemaining ?? null,
    isLoading,
    error: error?.message ?? data?.message ?? null,
    isConfigured: error?.message !== "API key not configured",
    refetch,
  };
}