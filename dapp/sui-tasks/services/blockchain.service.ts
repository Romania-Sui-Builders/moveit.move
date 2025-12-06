// services/blockchain.service.ts
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { PACKAGE_ID, NETWORK, BOARD_TYPE } from '@/core/constants';

const suiClient = new SuiClient({ url: getFullnodeUrl(NETWORK as 'testnet' | 'mainnet' | 'devnet') });

export interface BlockchainBoard {
  id: string;
  name: string;
  description: string;
  statuses: string[];
  taskCounter: number;
  taskIds: string[]; // ✅ Added: Object IDs of all tasks in the board
  createdAt: number;
  version: number;
  owner?: string;
}

export interface BlockchainTask {
  id: string; // ✅ Changed: Task Object ID (not task number)
  boardId: string;
  taskNumber: number; // ✅ Added: Sequential number within board (for display)
  title: string;
  description: string;
  dueDate: number;
  status: string;
  effort: number;
  assignees: string[];
  creator: string;
  createdAt: number;
  updatedAt: number;
  parentTaskId?: string; // ✅ Changed: Object ID (not number)
  subtaskIds: string[]; // ✅ Changed: Object IDs (not numbers)
}

/**
 * Query all Board objects from the blockchain
 */
export async function getBoardsFromBlockchain(): Promise<BlockchainBoard[]> {
  try {
    // Query for all Board objects of our package
    const response = await suiClient.getOwnedObjects({
      owner: PACKAGE_ID, // This won't work - Boards are shared objects
      filter: {
        StructType: BOARD_TYPE,
      },
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    // Since boards are shared objects, we need a different approach
    // We'll use dynamic field queries or event-based tracking
    console.warn('Direct board query from blockchain needs event-based approach');
    return [];
  } catch (error) {
    console.error('Error fetching boards from blockchain:', error);
    return [];
  }
}

/**
 * Get a specific board by ID from blockchain
 */
export async function getBoardFromBlockchain(boardId: string): Promise<BlockchainBoard | null> {
  try {
    const object = await suiClient.getObject({
      id: boardId,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      },
    });

    if (!object.data || object.data.content?.dataType !== 'moveObject') {
      return null;
    }

    const content = object.data.content as any;
    const fields = content.fields;

    return {
      id: boardId,
      name: fields.name || '',
      description: fields.description || '',
      statuses: fields.statuses || [],
      taskCounter: parseInt(fields.task_counter || '0'),
      taskIds: fields.task_ids || [], // ✅ Fixed: Include task IDs
      createdAt: parseInt(fields.created_at || '0'),
      version: parseInt(fields.version || '1'),
    };
  } catch (error) {
    console.error('Error fetching board from blockchain:', error);
    return null;
  }
}

/**
 * Get board events from blockchain (alternative to querying objects)
 */
export async function getBoardEventsFromBlockchain(): Promise<any[]> {
  try {
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::moveit::BoardCreated`,
      },
      limit: 50,
      order: 'descending',
    });

    return events.data.map((event) => ({
      boardId: (event.parsedJson as any)?.board_id,
      name: (event.parsedJson as any)?.name,
      createdBy: (event.parsedJson as any)?.created_by,
      version: (event.parsedJson as any)?.version,
      timestamp: event.timestampMs,
    }));
  } catch (error) {
    console.error('Error fetching board events:', error);
    return [];
  }
}

/**
 * Get task events for a specific board
 */
export async function getTaskEventsFromBlockchain(boardId: string): Promise<any[]> {
  try {
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::moveit::TaskCreated`,
      },
      limit: 100,
      order: 'descending',
    });

    // Filter by board ID
    return events.data
      .filter((event) => (event.parsedJson as any)?.board_id === boardId)
      .map((event) => ({
        boardId: (event.parsedJson as any)?.board_id,
        taskId: (event.parsedJson as any)?.task_id,
        title: (event.parsedJson as any)?.title,
        creator: (event.parsedJson as any)?.creator,
        timestamp: event.timestampMs,
      }));
  } catch (error) {
    console.error('Error fetching task events:', error);
    return [];
  }
}

/**
 * Get owned ContributorCap objects for a user
 */
export async function getContributorCapsFromBlockchain(address: string): Promise<any[]> {
  try {
    const response = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::moveit::ContributorCap`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    return response.data.map((obj) => {
      const content = obj.data?.content as any;
      return {
        id: obj.data?.objectId,
        boardId: content?.fields?.board_id,
      };
    });
  } catch (error) {
    console.error('Error fetching contributor caps:', error);
    return [];
  }
}

/**
 * Get task by Object ID (tasks are shared objects)
 * ✅ FIXED: Query task directly by Object ID, not via dynamic fields
 */
export async function getTaskFromBlockchain(taskObjectId: string): Promise<BlockchainTask | null> {
  try {
    const object = await suiClient.getObject({
      id: taskObjectId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!object.data || object.data.content?.dataType !== 'moveObject') {
      return null;
    }

    const content = object.data.content as any;
    const fields = content.fields;

    return {
      id: taskObjectId, // ✅ Object ID, not task_number
      boardId: fields.board_id,
      taskNumber: parseInt(fields.task_number || '0'), // ✅ Sequential number for display
      title: fields.title || '',
      description: fields.description || '',
      dueDate: parseInt(fields.due_date || '0'),
      status: fields.status || '',
      effort: parseInt(fields.effort || '0'),
      assignees: fields.assignees || [],
      creator: fields.creator || '',
      createdAt: parseInt(fields.created_at || '0'),
      updatedAt: parseInt(fields.updated_at || '0'),
      parentTaskId: fields.parent_task_id?.vec?.[0], // ✅ Object ID
      subtaskIds: fields.subtask_ids || [], // ✅ Object IDs
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
}

/**
 * Get all tasks for a board by querying task_ids from the board
 * ✅ NEW: Properly fetch tasks using task Object IDs stored in board.task_ids
 */
export async function getTasksForBoard(boardId: string): Promise<BlockchainTask[]> {
  try {
    const board = await getBoardFromBlockchain(boardId);
    if (!board || !board.taskIds || board.taskIds.length === 0) return [];

    // Fetch all tasks in parallel
    const taskPromises = board.taskIds.map(taskId => getTaskFromBlockchain(taskId));
    const tasks = await Promise.all(taskPromises);
    
    // Filter out null results
    return tasks.filter((task): task is BlockchainTask => task !== null);
  } catch (error) {
    console.error('Error fetching tasks for board:', error);
    return [];
  }
}

export const blockchainService = {
  getBoardsFromBlockchain,
  getBoardFromBlockchain,
  getBoardEventsFromBlockchain,
  getTaskEventsFromBlockchain,
  getContributorCapsFromBlockchain,
  getTaskFromBlockchain, // ✅ Updated function name
  getTasksForBoard, // ✅ New function for fetching all tasks
};
