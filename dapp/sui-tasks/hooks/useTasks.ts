// hooks/useTasks.ts
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TASK_TYPE, PACKAGE_ID, CLOCK_ID } from '@/core/constants';
import { parseTask } from '@/utils/sui';
import { useToast } from './useToast';
import type { Task, TaskStatus } from '@/types/board';

export function useTasks(boardId?: string) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ['tasks', boardId, account?.address],
    queryFn: async () => {
      if (!account?.address || !boardId) return [];

      // Note: This would need to be adjusted based on your actual smart contract structure
      // For now, we'll assume we can fetch tasks by owner or through board relationship
      const { data } = await suiClient.getOwnedObjects({
        owner: account.address,
        filter: { StructType: TASK_TYPE },
        options: { showContent: true },
      });

      const tasks = data.map(parseTask);
      return tasks.filter(task => task.boardId === boardId);
    },
    enabled: !!account?.address && !!boardId,
  });
}

interface CreateTaskData {
  title: string;
  description: string;
  assignee: string;
  status: TaskStatus;
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

      // Note: This needs to be adjusted based on your actual smart contract
      // You'll need the capability ID to create tasks
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::task::create`,
        arguments: [
          tx.object(boardId),
          tx.pure.string(data.title),
          tx.pure.string(data.description),
          tx.pure.address(data.assignee || account.address),
          tx.pure.u8(data.status),
          tx.pure.u64(data.dueDate),
          tx.pure.u64(data.effortHours),
          tx.object(CLOCK_ID),
          // capability object would go here
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
  taskId: string;
  updates: Partial<CreateTaskData>;
}

export function useUpdateTask() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ taskId, updates }: UpdateTaskData) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      // Note: This needs to be adjusted based on your actual smart contract
      // You'll need the capability ID and task object
      const tx = new Transaction();
      
      if (updates.status !== undefined) {
        tx.moveCall({
          target: `${PACKAGE_ID}::task::update_status`,
          arguments: [
            tx.object(taskId),
            tx.pure.u8(updates.status),
            // capability object would go here
            tx.object(CLOCK_ID),
          ],
        });
      }

      // Add more update calls for other fields as needed

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