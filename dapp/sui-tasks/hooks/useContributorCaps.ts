// hooks/useContributorCaps.ts
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { blockchainService } from '@/services/blockchain.service';

/**
 * Hook to fetch user's ContributorCaps
 * Returns all ContributorCap objects owned by the current user
 */
export function useContributorCaps() {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['contributor-caps', account?.address],
    queryFn: async () => {
      if (!account) return [];
      
      const caps = await blockchainService.getContributorCapsFromBlockchain(account.address);
      return caps;
    },
    enabled: !!account,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });
}

/**
 * Hook to get ContributorCap for a specific board
 */
export function useContributorCapForBoard(boardId: string) {
  const account = useCurrentAccount();

  return useQuery({
    queryKey: ['contributor-cap', boardId, account?.address],
    queryFn: async () => {
      if (!account || !boardId) return null;
      
      const caps = await blockchainService.getContributorCapsFromBlockchain(account.address);
      
      // Find cap for this specific board
      const cap = caps.find(c => c.boardId === boardId);
      return cap || null;
    },
    enabled: !!account && !!boardId,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

/**
 * Check if user has ContributorCap for a board
 */
export function useHasContributorAccess(boardId: string): boolean {
  const { data: cap } = useContributorCapForBoard(boardId);
  return !!cap;
}
