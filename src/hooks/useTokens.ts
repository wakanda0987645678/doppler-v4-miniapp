import { useQuery } from "@tanstack/react-query";
import { getTokens } from "@/utils/graphql";

export const useTokens = () => {
  return useQuery({
    queryKey: ["tokens"],
    queryFn: async () => {
      try {
        const tokens = await getTokens();
        console.log("Fetched tokens:", tokens); // For debugging
        return tokens;
      } catch (error) {
        console.error("Failed to fetch tokens:", error);
        throw error;
      }
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
};
