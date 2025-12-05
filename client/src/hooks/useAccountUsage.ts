import { useQuery } from "@tanstack/react-query";

interface UsageResponse {
  messagesSent: number;
  messagesDelivered: number;
  messagesFailed: number;
  successRate: number;
  totalSpent: string;
}

export function useAccountUsage() {
  const { data, isLoading, error, refetch } = useQuery<UsageResponse>({
    queryKey: ["/api/account/usage"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    retry: false, // Don't retry on failure
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });

  return {
    messagesSent: data?.messagesSent ?? 0,
    messagesDelivered: data?.messagesDelivered ?? 0,
    messagesFailed: data?.messagesFailed ?? 0,
    successRate: data?.successRate ?? 0,
    totalSpent: data?.totalSpent ?? "$0.00",
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
}