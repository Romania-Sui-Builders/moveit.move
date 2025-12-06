// hooks/useTasks.ts
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, CLOCK_ID } from '@/core/constants';
import { useToast } from './useToast';

export function useTasks(boardId?: string) {
  return useQuery({
    queryKey: ['tasks', boardId],
    queryFn: async () => {
      if (!boardId) return [];

      const response = await fetch(`/api/boards/${boardId}/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      return data.tasks || [];
    },
    enabled: !!boardId,
    refetchInterval: 3000, // Refresh every 3 seconds
    refetchOnWindowFocus: true,
  });
}

interface CreateTaskData {
  contributorCapId: string;
  title: string;
  description: string;
  assignee?: string;
  dueDate: number;
  effortHours: number;
}

export function useCreateTask(boardId: string) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTaskData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      // Create task using MoveIt contract
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::create_task`,
        arguments: [
          tx.object(data.contributorCapId), // ContributorCap
          tx.object(boardId), // Board (shared object)
          tx.pure.string(data.title),
          tx.pure.string(data.description),
          tx.pure.u64(data.dueDate),
          tx.pure.u64(data.effortHours),
          tx.pure.vector('address', data.assignee ? [data.assignee] : [account.address]),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', boardId] });
    },
    onError: (error) => {
      toast(
        'Failed to create task',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}

interface UpdateTaskData {
  taskObjectId: string; // ✅ Changed: Task Object ID (not task number)
  boardId: string;
  contributorCapId: string;
  updates: {
    title?: string;
    description?: string;
    dueDate?: number;
    effortHours?: number;
  };
}

export function useUpdateTask() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskObjectId, boardId, contributorCapId, updates }: UpdateTaskData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      if (!contributorCapId) {
        throw new Error('Contributor capability required');
      }

      // Update task using MoveIt contract
      const tx = new Transaction();
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::update_task`,
        arguments: [
          tx.object(contributorCapId),
          tx.object(boardId),
          tx.object(taskObjectId), // ✅ FIXED: Pass task OBJECT, not task number
          tx.pure.string(updates.title || ''),
          tx.pure.string(updates.description || ''),
          tx.pure.u64(updates.dueDate || 0),
          tx.pure.u64(updates.effortHours || 0),
          tx.object(CLOCK_ID),
        ],
      });

      return signAndExecute({ transaction: tx });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast(
        'Failed to update task',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}