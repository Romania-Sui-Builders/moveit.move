// services/moveit.service.ts
import { Transaction } from '@mysten/sui/transactions';
import { 
  ADMIN_CAP_ID, 
  CLOCK_ID, 
  MODULE_TARGETS 
} from '@/core/constants';

export interface CreateBoardParams {
  name: string;
  description: string;
  initialStatuses: string[];
}

export interface CreateTaskParams {
  contributorCapId: string;
  boardId: string;
  title: string;
  description: string;
  dueDate: number;
  effort: number;
  assignees: string[];
}

export interface UpdateTaskParams {
  contributorCapId: string;
  boardId: string;
  taskId: number;
  title: string;
  description: string;
  dueDate: number;
  effort: number;
}

export interface UpdateTaskStatusParams {
  contributorCapId: string;
  boardId: string;
  taskId: number;
  newStatus: string;
}

export interface AssignTaskParams {
  contributorCapId: string;
  boardId: string;
  taskId: number;
  assignees: string[];
}

export interface CreateSubtaskParams {
  contributorCapId: string;
  boardId: string;
  parentTaskId: number;
  title: string;
  description: string;
  dueDate: number;
  effort: number;
  assignees: string[];
}

export interface AddContributorParams {
  boardId: string;
  contributorAddress: string;
}

export interface AddStatusParams {
  boardId: string;
  status: string;
}

export interface RemoveStatusParams {
  boardId: string;
  status: string;
}

export class MoveItContractService {
  /**
   * Create a new board (requires AdminCap)
   */
  createBoard(params: CreateBoardParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.CREATE_BOARD,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.pure.string(params.name),
        tx.pure.string(params.description),
        tx.pure.vector('string', params.initialStatuses),
        tx.object(CLOCK_ID),
      ],
    });

    return tx;
  }

  /**
   * Update board metadata (requires AdminCap)
   */
  updateBoard(boardId: string, name: string, description: string): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.UPDATE_BOARD,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(boardId),
        tx.pure.string(name),
        tx.pure.string(description),
      ],
    });

    return tx;
  }

  /**
   * Add a status to board workflow (requires AdminCap)
   */
  addStatus(params: AddStatusParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.ADD_STATUS,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(params.boardId),
        tx.pure.string(params.status),
      ],
    });

    return tx;
  }

  /**
   * Remove a status from board workflow (requires AdminCap)
   */
  removeStatus(params: RemoveStatusParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.REMOVE_STATUS,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(params.boardId),
        tx.pure.string(params.status),
      ],
    });

    return tx;
  }

  /**
   * Add a contributor to a board (requires AdminCap)
   */
  addContributor(params: AddContributorParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.ADD_CONTRIBUTOR,
      arguments: [
        tx.object(ADMIN_CAP_ID),
        tx.object(params.boardId),
        tx.pure.address(params.contributorAddress),
      ],
    });

    return tx;
  }

  /**
   * Create a new task (requires ContributorCap)
   */
  createTask(params: CreateTaskParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.CREATE_TASK,
      arguments: [
        tx.object(params.contributorCapId),
        tx.object(params.boardId),
        tx.pure.string(params.title),
        tx.pure.string(params.description),
        tx.pure.u64(params.dueDate),
        tx.pure.u64(params.effort),
        tx.pure.vector('address', params.assignees),
        tx.object(CLOCK_ID),
      ],
    });

    return tx;
  }

  /**
   * Update task details (requires ContributorCap)
   */
  updateTask(params: UpdateTaskParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.UPDATE_TASK,
      arguments: [
        tx.object(params.contributorCapId),
        tx.object(params.boardId),
        tx.pure.u64(params.taskId),
        tx.pure.string(params.title),
        tx.pure.string(params.description),
        tx.pure.u64(params.dueDate),
        tx.pure.u64(params.effort),
        tx.object(CLOCK_ID),
      ],
    });

    return tx;
  }

  /**
   * Update task status (requires ContributorCap)
   */
  updateTaskStatus(params: UpdateTaskStatusParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.UPDATE_TASK_STATUS,
      arguments: [
        tx.object(params.contributorCapId),
        tx.object(params.boardId),
        tx.pure.u64(params.taskId),
        tx.pure.string(params.newStatus),
        tx.object(CLOCK_ID),
      ],
    });

    return tx;
  }

  /**
   * Assign users to a task (requires ContributorCap)
   */
  assignTask(params: AssignTaskParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.ASSIGN_TASK,
      arguments: [
        tx.object(params.contributorCapId),
        tx.object(params.boardId),
        tx.pure.u64(params.taskId),
        tx.pure.vector('address', params.assignees),
        tx.object(CLOCK_ID),
      ],
    });

    return tx;
  }

  /**
   * Create a subtask (requires ContributorCap)
   */
  createSubtask(params: CreateSubtaskParams): Transaction {
    const tx = new Transaction();

    tx.moveCall({
      target: MODULE_TARGETS.CREATE_SUBTASK,
      arguments: [
        tx.object(params.contributorCapId),
        tx.object(params.boardId),
        tx.pure.u64(params.parentTaskId),
        tx.pure.string(params.title),
        tx.pure.string(params.description),
        tx.pure.u64(params.dueDate),
        tx.pure.u64(params.effort),
        tx.pure.vector('address', params.assignees),
        tx.object(CLOCK_ID),
      ],
    });

    return tx;
  }
}

export const moveItContract = new MoveItContractService();
