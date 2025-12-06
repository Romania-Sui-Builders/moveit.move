// hooks/useTasks.ts
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { PACKAGE_ID, CLOCK_ID } from "@/core/constants";
import { useToast } from "./useToast";

export function useTasks(boardId?: string) {
  return useQuery({
    queryKey: ["tasks", boardId],
    queryFn: async () => {
      if (!boardId) return [];

      const response = await fetch(`/api/boards/${boardId}/tasks`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
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
  contributorCapId: { id: string };
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
        throw new Error("Wallet not connected");
      }

      console.log("Creating task with data:", {
        contributorCapId: data.contributorCapId,
        boardId,
        title: data.title,
        assignee: data.assignee || account.address,
      });

      // Create task using MoveIt contract
      const tx = new Transaction();

      // Prepare assignees array - ensure addresses are normalized
      const assigneeAddress = data.assignee || account.address;
      const assignees = [assigneeAddress];

      console.log({ data, assignees });
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::create_task`,
        arguments: [
          tx.object(data.contributorCapId.id), // ContributorCap (owned object)
          tx.object(boardId), // Board (shared object)
          tx.pure.string(data.title),
          tx.pure.string(data.description),
          tx.pure.u64(data.dueDate),
          tx.pure.u64(data.effortHours), // effort parameter (story points/hours)
          tx.pure(bcs.vector(bcs.Address).serialize(assignees).toBytes()), // assignees vector
          tx.object(CLOCK_ID), // Clock (shared object)
        ],
      });

      const result = await signAndExecute({ transaction: tx });
      console.log("Task creation transaction result:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
    onError: (error) => {
      toast(
        "Failed to create task",
        error instanceof Error ? error.message : "Transaction failed",
        "error"
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
    mutationFn: async ({
      taskObjectId,
      boardId,
      contributorCapId,
      updates,
    }: UpdateTaskData) => {
      if (!account) {
        throw new Error("Wallet not connected");
      }

      if (!contributorCapId) {
        throw new Error("Contributor capability required");
      }

      console.log("🔄 Updating task on blockchain:", {
        taskObjectId,
        boardId,
        contributorCapId,
        updates,
        packageId: PACKAGE_ID,
      });

      // CRITICAL: Check if task exists as a separate object
      // For boards with task_ids vector, tasks should be separate objects
      // For boards with Table structure, this won't work
      try {
        const suiClient = await import('@mysten/dapp-kit').then(m => m.useSuiClient);
        // Note: We can't call hooks here, so we'll proceed with the transaction
      } catch (e) {
        console.warn("Could not validate task object:", e);
      }

      // Update task using MoveIt contract
      const tx = new Transaction();

      // All objects use tx.object() - SDK resolves shared vs owned automatically
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::update_task`,
        arguments: [
          tx.object(contributorCapId), // ContributorCap (owned by user)
          tx.object(boardId),          // Board (shared, immutable ref &Board)
          tx.object(taskObjectId),     // Task (shared, mutable ref &mut Task)
          tx.pure.string(updates.title || ""),
          tx.pure.string(updates.description || ""),
          tx.pure.u64(updates.dueDate || 0),
          tx.pure.u64(updates.effortHours || 0),
          tx.object(CLOCK_ID),         // Clock (shared)
        ],
      });

      console.log("📤 Transaction built, sending to wallet...");

      try {
        const result = await signAndExecute({ transaction: tx });
        console.log("✅ Task update transaction result:", result);
        return result;
      } catch (error) {
        console.error("❌ Task update transaction failed:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (error) => {
      toast(
        "Failed to update task",
        error instanceof Error ? error.message : "Transaction failed",
        "error"
      );
    },
  });
}
