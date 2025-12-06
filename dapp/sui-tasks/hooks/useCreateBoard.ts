// hooks/useCreateBoard.ts
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PACKAGE_ID, CLOCK_ID } from '@/core/constants';
import { useToast } from './useToast';

interface CreateBoardData {
  name: string;
  description: string;
}

export function useCreateBoard() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, description }: CreateBoardData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::board::create`,
        arguments: [
          tx.pure.string(name),
          tx.pure.string(description),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
    onError: (error) => {
      toast(
        'Failed to create board',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}