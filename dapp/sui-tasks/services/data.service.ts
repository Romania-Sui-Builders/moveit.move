// services/data.service.ts
import { INDEXER_URL } from '@/core/constants';
import { blockchainService, BlockchainBoard, BlockchainTask } from './blockchain.service';

export interface Board {
  id: string;
  name: string;
  description: string;
  statuses: string[];
  taskCounter?: number;
  createdAt: number;
  version?: number;
  owner?: string;
  members?: string[];
}

export interface Task {
  id: string;
  boardId: string;
  taskId: number;
  title: string;
  description: string;
  dueDate: number;
  status: string;
  effort: number;
  assignees: string[];
  creator: string;
  createdAt: number;
  updatedAt: number;
  parentTaskId?: number;
  subtaskIds?: number[];
}

/**
 * Fetch boards with fallback strategy:
 * 1. Try indexer
 * 2. Fall back to blockchain events
 */
export async function getBoards(): Promise<Board[]> {
  // Try indexer first
  try {
    const response = await fetch(`${INDEXER_URL}/api/boards`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Boards fetched from indexer');
      return data.boards || data || [];
    }
  } catch (error) {
    console.warn('⚠️ Indexer unavailable, falling back to blockchain');
  }

  // Fall back to blockchain events
  try {
    const events = await blockchainService.getBoardEventsFromBlockchain();
    
    // Fetch full board details for each event
    const boards = await Promise.all(
      events.map(async (event) => {
        const board = await blockchainService.getBoardFromBlockchain(event.boardId);
        if (board) {
          return {
            ...board,
            owner: event.createdBy,
            members: [event.createdBy],
          } as Board;
        }
        return null;
      })
    );

    const validBoards = boards.filter((b): b is Board => b !== null);
    console.log('✅ Boards fetched from blockchain events:', validBoards.length);
    return validBoards;
  } catch (error) {
    console.error('❌ Error fetching boards from blockchain:', error);
    return [];
  }
}

/**
 * Fetch a specific board with fallback
 */
export async function getBoard(boardId: string): Promise<Board | null> {
  // Try indexer first
  try {
    const response = await fetch(`${INDEXER_URL}/api/boards/${boardId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Board fetched from indexer');
      return data.board || data;
    }
  } catch (error) {
    console.warn('⚠️ Indexer unavailable, falling back to blockchain');
  }

  // Fall back to blockchain
  try {
    const board = await blockchainService.getBoardFromBlockchain(boardId);
    if (board) {
      console.log('✅ Board fetched from blockchain');
      return board;
    }
  } catch (error) {
    console.error('❌ Error fetching board from blockchain:', error);
  }

  return null;
}

/**
 * Fetch tasks for a board with fallback
 */
export async function getTasks(boardId: string): Promise<Task[]> {
  // Try indexer first
  let indexerTasks: Task[] = [];
  try {
    const response = await fetch(`${INDEXER_URL}/api/boards/${boardId}/tasks`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      indexerTasks = data.tasks || data || [];
      console.log(`✅ Indexer responded with ${indexerTasks.length} tasks`);
      
      // If indexer has tasks, return them
      if (indexerTasks.length > 0) {
        return indexerTasks;
      }
    }
  } catch (error) {
    console.warn('⚠️ Indexer unavailable, falling back to blockchain');
  }

  // Fall back to blockchain if indexer returned no tasks
  console.log(`📡 Fetching tasks from blockchain for board: ${boardId}`);
  try {
    // Fetch all tasks for the board directly
    const blockchainTasks = await blockchainService.getTasksForBoard(boardId);
    console.log(`🔗 Blockchain returned ${blockchainTasks.length} raw tasks`);
    
    // Transform blockchain tasks to app Task format
    const tasks: Task[] = blockchainTasks.map(task => {
      console.log('📝 Transforming task:', { id: task.id, taskNumber: task.taskNumber, title: task.title });
      return {
        id: task.id, // Task Object ID
        boardId: task.boardId,
        taskId: task.taskNumber, // Legacy field - task number
        title: task.title,
        description: task.description,
        status: task.status,
        assignees: task.assignees,
        dueDate: task.dueDate,
        effort: task.effort,
        creator: task.creator,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        parentTaskId: undefined, // Would need mapping
        subtaskIds: [], // Would need mapping
      };
    });

    console.log('✅ Tasks fetched from blockchain:', tasks.length, tasks);
    return tasks;
  } catch (error) {
    console.error('❌ Error fetching tasks from blockchain:', error);
    return [];
  }
}

/**
 * Fetch a specific task with fallback
 */
export async function getTask(boardId: string, taskId: number): Promise<Task | null> {
  // Try indexer first
  try {
    const response = await fetch(`${INDEXER_URL}/api/boards/${boardId}/tasks/${taskId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Task fetched from indexer');
      return data.task || data;
    }
  } catch (error) {
    console.warn('⚠️ Indexer unavailable, falling back to blockchain');
  }

  // Fall back to blockchain - need to get all tasks and find by number
  try {
    const allTasks = await getTasks(boardId);
    const task = allTasks.find(t => t.taskId === taskId);
    if (task) {
      console.log('✅ Task found via board tasks fetch');
      return task;
    }
  } catch (error) {
    console.error('❌ Error fetching task from blockchain:', error);
  }

  return null;
}

/**
 * Get contributor caps for a user
 */
export async function getContributorCaps(address: string): Promise<any[]> {
  // Try indexer first
  try {
    const response = await fetch(`${INDEXER_URL}/api/contributors/${address}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Contributor caps fetched from indexer');
      return data.caps || data || [];
    }
  } catch (error) {
    console.warn('⚠️ Indexer unavailable, falling back to blockchain');
  }

  // Fall back to blockchain
  try {
    const caps = await blockchainService.getContributorCapsFromBlockchain(address);
    console.log('✅ Contributor caps fetched from blockchain:', caps.length);
    return caps;
  } catch (error) {
    console.error('❌ Error fetching contributor caps from blockchain:', error);
    return [];
  }
}

export const dataService = {
  getBoards,
  getBoard,
  getTasks,
  getTask,
  getContributorCaps,
};
