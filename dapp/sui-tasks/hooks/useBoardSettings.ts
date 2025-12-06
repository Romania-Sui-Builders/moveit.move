// hooks/useBoardSettings.ts
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID } from '@/core/constants';
import { useToast } from './useToast';

interface UpdateBoardData {
  adminCapId: string;
  boardId: string;
  name: string;
  description: string;
}

interface AddStatusData {
  adminCapId: string;
  boardId: string;
  status: string;
}

interface RemoveStatusData {
  adminCapId: string;
  boardId: string;
  status: string;
}

/**
 * Hook to update board name and description
 * Requires AdminCap
 */
export function useUpdateBoard() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ adminCapId, boardId, name, description }: UpdateBoardData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!adminCapId) {
        throw new Error('Admin capability required to update board');
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::update_board`,
        arguments: [
          tx.object(adminCapId), // AdminCap
          tx.object(boardId), // Board (shared object)
          tx.pure.string(name),
          tx.pure.string(description),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast('Board updated', 'Board settings have been saved', 'success');
    },
    onError: (error) => {
      toast(
        'Failed to update board',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}

/**
 * Hook to add a status to board workflow
 * Requires AdminCap
 */
export function useAddStatus() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ adminCapId, boardId, status }: AddStatusData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!adminCapId) {
        throw new Error('Admin capability required to add status');
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::add_status`,
        arguments: [
          tx.object(adminCapId), // AdminCap
          tx.object(boardId), // Board (shared object)
          tx.pure.string(status),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast('Status added', 'New workflow status has been added', 'success');
    },
    onError: (error) => {
      toast(
        'Failed to add status',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}

/**
 * Hook to remove a status from board workflow
 * Requires AdminCap
 * Note: Cannot remove the last status (contract validation)
 */
export function useRemoveStatus() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ adminCapId, boardId, status }: RemoveStatusData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!adminCapId) {
        throw new Error('Admin capability required to remove status');
      }

      const tx = new Transaction();

      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::remove_status`,
        arguments: [
          tx.object(adminCapId), // AdminCap
          tx.object(boardId), // Board (shared object)
          tx.pure.string(status),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast('Status removed', 'Workflow status has been removed', 'success');
    },
    onError: (error) => {
      toast(
        'Failed to remove status',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}
