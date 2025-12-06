// hooks/useIndexedBoards.ts
import useSWR from 'swr';
import { indexerService, BoardCreatedEvent } from '@/services/indexer.service';

const fetcher = () => indexerService.getBoardsWithMetadata();

export function useIndexedBoards() {
  const { data, error, isLoading, mutate } = useSWR<Array<BoardCreatedEvent & { taskCount: number }>>(
    '/api/indexer/boards',
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
      revalidateOnFocus: true,
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
