import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { getApiUrl } from "@/config/api";

interface Feature {
  id: string;
  name: string;
  description: string;
  is_enabled: boolean;
}

export const useFeatures = () => {
  const { data: features } = useQuery({
    queryKey: ['enabled-features'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/admin/features.php'));
      if (!response.ok) return [];
      const data = await response.json();
      return data.features as Feature[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isFeatureEnabled = useCallback((featureId: string): boolean => {
    const feature = features?.find(f => f.id === featureId);
    return feature?.is_enabled ?? true; // Default to enabled if not found
  }, [features]);

  return { features, isFeatureEnabled };
};
