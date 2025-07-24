import { useQuery, keepPreviousData } from "@tanstack/react-query";
import api from "../Interceptors/Interceptor";

// Get users for autocomplete
export const useUsersAutocomplete = (searchTerm = "") => {
  return useQuery({
    queryKey: ["users", "autocomplete", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      const response = await api.get(
        `/users/autocomplete?${params.toString()}`
      );
      return response.data.users || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, but can be controlled by parent component
    placeholderData: keepPreviousData, // Keep previous data while fetching new data to prevent blinking
    refetchOnWindowFocus: false, // Prevent unnecessary refetches that might cause blinking
  });
};
