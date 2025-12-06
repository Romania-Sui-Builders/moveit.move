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
  try {
    const response = await fetch(`${INDEXER_URL}/api/boards/${boardId}/tasks`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Tasks fetched from indexer');
      return data.tasks || data || [];
    }
  } catch (error) {
    console.warn('⚠️ Indexer unavailable, falling back to blockchain');
  }

  // Fall back to blockchain
  try {
    // Get task events
    const events = await blockchainService.getTaskEventsFromBlockchain(boardId);
    
    // Fetch full task details for each event
    const tasks = await Promise.all(
      events.map(async (event) => {
        const task = await blockchainService.getTaskFromBoard(boardId, event.taskId);
        if (task) {
          return {
            id: `${boardId}-${task.taskId}`,
            ...task,
            subtaskIds: task.subtaskIds || [],
          } as Task;
        }
        return null;
      })
    );

    const validTasks = tasks.filter((t): t is Task => t !== null);
    console.log('✅ Tasks fetched from blockchain:', validTasks.length);
    return validTasks;
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

  // Fall back to blockchain
  try {
    const task = await blockchainService.getTaskFromBoard(boardId, taskId);
    if (task) {
      console.log('✅ Task fetched from blockchain');
      return {
        id: `${boardId}-${taskId}`,
        ...task,
      };
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
