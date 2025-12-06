// hooks/useIndexedBoards.ts
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch boards');
  }
  const data = await response.json();
  return data.boards || data || [];
};

export function useIndexedBoards() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/boards',
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    boards: data || [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
