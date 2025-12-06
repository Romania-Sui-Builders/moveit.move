// hooks/useIndexedTasks.ts
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  const data = await response.json();
  return data.tasks || data || [];
};

export function useIndexedTasks(boardId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    boardId ? `/api/boards/${boardId}/tasks` : null,
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    tasks: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
