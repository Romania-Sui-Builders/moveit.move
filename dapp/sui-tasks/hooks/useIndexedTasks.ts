// hooks/useIndexedTasks.ts
import useSWR from 'swr';
import { indexerService } from '@/services/indexer.service';

const fetcher = (boardId: string) => indexerService.getTasksForBoard(boardId);

export function useIndexedTasks(boardId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    boardId ? ['/api/indexer/tasks', boardId] : null,
    () => boardId ? fetcher(boardId) : [],
    {
      refreshInterval: 3000, // Refresh every 3 seconds
      revalidateOnFocus: true,
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
