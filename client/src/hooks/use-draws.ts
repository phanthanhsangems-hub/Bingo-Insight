import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type CreateDrawRequest } from "@shared/routes";

// ============================================
// DATA HOOKS
// ============================================

export function useDraws(limit = 100) {
  return useQuery({
    queryKey: [api.draws.list.path, limit],
    queryFn: async () => {
      // Pass limit as query param manually since buildUrl only handles path params
      const res = await fetch(`${api.draws.list.path}?limit=${limit}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch draws");
      // In a real app we would parse with Zod here, but for now we trust the backend type
      return await res.json(); 
    },
  });
}

export function useLatestDraw() {
  return useQuery({
    queryKey: [api.draws.latest.path],
    queryFn: async () => {
      const res = await fetch(api.draws.latest.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch latest draw");
      return await res.json();
    },
    refetchInterval: 10000, // Poll every 10s for new results
  });
}

export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return await res.json();
    },
    refetchInterval: 30000,
  });
}

export function usePrediction() {
  return useQuery({
    queryKey: [api.prediction.get.path],
    queryFn: async () => {
      const res = await fetch(api.prediction.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch prediction");
      return await res.json();
    },
    // Prediction depends on latest data, so it might change frequently
    refetchInterval: 15000,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useCreateDraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDrawRequest) => {
      const validated = api.draws.create.input.parse(data);
      const res = await fetch(api.draws.create.path, {
        method: api.draws.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.draws.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add draw");
      }
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate all relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: [api.draws.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.draws.latest.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.prediction.get.path] });
    },
  });
}
