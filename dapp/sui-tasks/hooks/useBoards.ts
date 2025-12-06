// hooks/useBoards.ts
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import { BOARD_TYPE } from '@/core/constants';
import { parseBoard } from '@/utils/sui';
import type { Board } from '@/types/board';

export function useBoards() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ['boards', account?.address],
    queryFn: async () => {
      if (!account?.address) return [];

      const { data } = await suiClient.getOwnedObjects({
        owner: account.address,
        filter: { StructType: BOARD_TYPE },
        options: { showContent: true },
      });

      return data.map(parseBoard);
    },
    enabled: !!account?.address,
  });
}