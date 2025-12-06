// hooks/useMoveItContract.ts
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './useToast';
import { 
  moveItContract, 
  CreateBoardParams, 
  CreateTaskParams,
  UpdateTaskParams,
  UpdateTaskStatusParams,
  AssignTaskParams,
  AddContributorParams,
} from '@/services/moveit.service';

export function useCreateBoard() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateBoardParams) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const tx = moveItContract.createBoard(params);
      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/indexer/boards'] });
      toast('Success', 'Board created successfully', 'success');
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

export function useCreateTask() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: CreateTaskParams) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const tx = moveItContract.createTask(params);
      return signAndExecute({ transaction: tx });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/indexer/tasks', variables.boardId] 
      });
      toast('Success', 'Task created successfully', 'success');
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

export function useUpdateTask() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateTaskParams) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const tx = moveItContract.updateTask(params);
      return signAndExecute({ transaction: tx });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/indexer/tasks', variables.boardId] 
      });
      toast('Success', 'Task updated successfully', 'success');
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

export function useUpdateTaskStatus() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateTaskStatusParams) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const tx = moveItContract.updateTaskStatus(params);
      return signAndExecute({ transaction: tx });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/indexer/tasks', variables.boardId] 
      });
      toast('Success', 'Task status updated', 'success');
    },
    onError: (error) => {
      toast(
        'Failed to update task status',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}

export function useAssignTask() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: AssignTaskParams) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const tx = moveItContract.assignTask(params);
      return signAndExecute({ transaction: tx });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/indexer/tasks', variables.boardId] 
      });
      toast('Success', 'Task assigned successfully', 'success');
    },
    onError: (error) => {
      toast(
        'Failed to assign task',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}

export function useAddContributor() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: AddContributorParams) => {
      if (!account) {
        throw new Error('Wallet not connected');
      }

      const tx = moveItContract.addContributor(params);
      return signAndExecute({ transaction: tx });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/indexer/boards'] });
      toast('Success', 'Contributor added successfully', 'success');
    },
    onError: (error) => {
      toast(
        'Failed to add contributor',
        error instanceof Error ? error.message : 'Transaction failed',
        'error'
      );
    },
  });
}
