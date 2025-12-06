// hooks/useCreateBoard.ts
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, CLOCK_ID, ADMIN_CAP_ID } from '@/core/constants';
import { useToast } from './useToast';

interface CreateBoardData {
  name: string;
  description: string;
  initialStatuses?: string[];
}

export function useCreateBoard() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ name, description, initialStatuses }: CreateBoardData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!ADMIN_CAP_ID || ADMIN_CAP_ID === 'YOUR_ADMIN_CAP_ID_HERE') {
        throw new Error('Admin capability not configured. Please set NEXT_PUBLIC_ADMIN_CAP_ID in .env');
      }

      const tx = new Transaction();
      
      // Default statuses if none provided
      const statuses = initialStatuses || ['To Do', 'In Progress', 'Done'];
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::create_board`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.pure.string(name),
          tx.pure.string(description),
          tx.pure.vector('string', statuses),
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