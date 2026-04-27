import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useRefreshData = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const refreshData = async (queryKeys?: string[]) => {
    setIsRefreshing(true);
    try {
      // Default query keys that are commonly used across pages
      const defaultQueryKeys = [
        "assets",
        "departments",
        "assetCategories",
        "faultReports",
        "assignments",
        "suppliers",
        "maintenance",
        "movements",
        "disposals",
        "users",
      ];

      // Use provided query keys or default ones
      const keysToRefresh = queryKeys || defaultQueryKeys;

      // Invalidate queries
      await Promise.all(
        keysToRefresh.map((key) =>
          queryClient.invalidateQueries({ queryKey: [key] })
        )
      );

      // Refetch queries
      await Promise.all(
        keysToRefresh.map((key) =>
          queryClient.refetchQueries({ queryKey: [key] })
        )
      );

      // Keep spinning for visual feedback (minimum 500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return { isRefreshing, refreshData };
};