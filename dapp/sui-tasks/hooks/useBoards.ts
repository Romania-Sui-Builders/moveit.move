// hooks/useBoards.ts
import { useQuery } from '@tanstack/react-query';

export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const response = await fetch('/api/boards');
      if (!response.ok) {
        throw new Error('Failed to fetch boards');
      }
      const data = await response.json();
      return data.boards || [];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true,
  });
}