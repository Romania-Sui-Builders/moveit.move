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
  tableId?: string; // For old Table structure
  tableSize?: number; // Number of tasks in Table
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
    
    console.log('📦 Raw board fields from blockchain:', JSON.stringify(fields, null, 2));

    // Handle both old Table structure and new task_ids vector
    let taskIds: string[] = [];
    
    if (fields.task_ids) {
      // New structure: task_ids vector
      console.log('✅ Using new task_ids vector structure');
      taskIds = fields.task_ids;
    } else if (fields.tasks) {
      // Old structure: Table
      console.log('⚠️ Board uses old Table structure - tasks stored in Table');
      console.log('📊 Table info:', fields.tasks);
      // For Table structure, we need to query dynamic fields
      // The table has a size, we need to iterate through it
      const tableId = fields.tasks.fields.id.id;
      const tableSize = parseInt(fields.tasks.fields.size || '0');
      console.log(`📋 Table ID: ${tableId}, Size: ${tableSize}`);
      
      // We'll need to query the table's dynamic fields
      // For now, store the table info so we can query it
      taskIds = []; // Will be populated by querying table dynamic fields
    }

    const board = {
      id: boardId,
      name: fields.name || '',
      description: fields.description || '',
      statuses: fields.statuses || [],
      taskCounter: parseInt(fields.task_counter || '0'),
      taskIds: taskIds,
      tableId: fields.tasks?.fields?.id?.id, // Store table ID if using old structure
      tableSize: fields.tasks ? parseInt(fields.tasks.fields.size || '0') : 0,
      createdAt: parseInt(fields.created_at || '0'),
      version: parseInt(fields.version || '1'),
    };
    
    console.log('✅ Parsed board:', JSON.stringify(board, null, 2));
    return board;
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
    console.log(`🔍 Fetching task object: ${taskObjectId}`);
    const object = await suiClient.getObject({
      id: taskObjectId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    if (!object.data || object.data.content?.dataType !== 'moveObject') {
      console.warn(`⚠️ Task ${taskObjectId} not found or invalid`);
      return null;
    }

    const content = object.data.content as any;
    const fields = content.fields;
    
    console.log(`📝 Raw task fields for ${taskObjectId}:`, JSON.stringify(fields, null, 2));

    const task = {
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
    
    console.log(`✅ Parsed task:`, task);
    return task;
  } catch (error) {
    console.error(`❌ Error fetching task ${taskObjectId}:`, error);
    return null;
  }
}

/**
 * Get all tasks for a board by querying task_ids from the board
 * ✅ NEW: Properly fetch tasks using task Object IDs stored in board.task_ids
 */
export async function getTasksForBoard(boardId: string): Promise<BlockchainTask[]> {
  try {
    console.log(`🔍 Fetching board from blockchain: ${boardId}`);
    const board = await getBoardFromBlockchain(boardId);
    
    if (!board) {
      console.warn('⚠️ Board not found on blockchain');
      return [];
    }
    
    // Handle old Table structure
    if (board.tableId && board.tableSize && board.tableSize > 0) {
      console.log(`� Board uses Table structure with ${board.tableSize} tasks`);
      return await getTasksFromTable(board.tableId, board.tableSize);
    }
    
    // Handle new task_ids vector structure
    console.log(`�📋 Board found with ${board.taskIds?.length || 0} task IDs:`, board.taskIds);
    
    if (!board.taskIds || board.taskIds.length === 0) {
      console.log('ℹ️ Board has no tasks yet');
      return [];
    }

    // Fetch all tasks in parallel
    console.log(`🔄 Fetching ${board.taskIds.length} tasks from blockchain...`);
    const taskPromises = board.taskIds.map(taskId => getTaskFromBlockchain(taskId));
    const tasks = await Promise.all(taskPromises);
    
    // Filter out null results
    const validTasks = tasks.filter((task): task is BlockchainTask => task !== null);
    console.log(`✅ Successfully fetched ${validTasks.length} tasks from blockchain`);
    return validTasks;
  } catch (error) {
    console.error('❌ Error fetching tasks for board:', error);
    return [];
  }
}

/**
 * Get tasks from a Table structure (old board format)
 */
async function getTasksFromTable(tableId: string, tableSize: number): Promise<BlockchainTask[]> {
  try {
    console.log(`📊 Querying Table dynamic fields: ${tableId}`);
    
    // Query all dynamic fields of the table
    const dynamicFields = await suiClient.getDynamicFields({
      parentId: tableId,
    });
    
    console.log(`🔑 Found ${dynamicFields.data.length} dynamic fields in table`);
    
    // Fetch each task from the dynamic fields
    const taskPromises = dynamicFields.data.map(async (field) => {
      try {
        const fieldObject = await suiClient.getDynamicFieldObject({
          parentId: tableId,
          name: {
            type: 'u64',
            value: field.name.value as string,
          },
        });
        
        if (fieldObject.data?.content?.dataType === 'moveObject') {
          const content = fieldObject.data.content as any;
          const fields = content.fields.value?.fields || content.fields;
          
          console.log(`📝 Task from table:`, fields);
          
          return {
            id: fieldObject.data.objectId,
            boardId: fields.board_id,
            taskNumber: parseInt(fields.task_number || field.name.value as string),
            title: fields.title || '',
            description: fields.description || '',
            dueDate: parseInt(fields.due_date || '0'),
            status: fields.status || '',
            effort: parseInt(fields.effort || '0'),
            assignees: fields.assignees || [],
            creator: fields.creator || '',
            createdAt: parseInt(fields.created_at || '0'),
            updatedAt: parseInt(fields.updated_at || '0'),
            parentTaskId: fields.parent_task_id?.vec?.[0],
            subtaskIds: fields.subtask_ids || [],
          } as BlockchainTask;
        }
        return null;
      } catch (error) {
        console.error(`Error fetching task from table field:`, error);
        return null;
      }
    });
    
    const tasks = await Promise.all(taskPromises);
    const validTasks = tasks.filter((task): task is BlockchainTask => task !== null);
    
    console.log(`✅ Fetched ${validTasks.length} tasks from Table`);
    return validTasks;
  } catch (error) {
    console.error('❌ Error fetching tasks from table:', error);
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
