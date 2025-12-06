// core/constants.ts
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
export const ADMIN_CAP_ID = process.env.NEXT_PUBLIC_ADMIN_CAP_ID || '';
export const CLOCK_ID = process.env.NEXT_PUBLIC_CLOCK_ID || '0x6'; // Sui Clock object
export const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL || 'http://localhost:3001';

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';

export const EXPLORER_URL = 
  NETWORK === 'testnet' 
    ? 'https://suiexplorer.com/?network=testnet'
    : NETWORK === 'mainnet'
    ? 'https://suiexplorer.com/?network=mainnet'
    : 'https://suiexplorer.com/?network=devnet';

// Type definitions based on the MoveIt contract
export const BOARD_TYPE = `${PACKAGE_ID}::moveit::Board`;
export const TASK_TYPE = `${PACKAGE_ID}::moveit::Task`;
export const ADMIN_CAP_TYPE = `${PACKAGE_ID}::moveit::AdminCap`;
export const CONTRIBUTOR_CAP_TYPE = `${PACKAGE_ID}::moveit::ContributorCap`;

// Module targets for transactions
export const MODULE_TARGETS = {
  CREATE_BOARD: `${PACKAGE_ID}::moveit::create_board`,
  UPDATE_BOARD: `${PACKAGE_ID}::moveit::update_board`,
  ADD_STATUS: `${PACKAGE_ID}::moveit::add_status`,
  REMOVE_STATUS: `${PACKAGE_ID}::moveit::remove_status`,
  ADD_CONTRIBUTOR: `${PACKAGE_ID}::moveit::add_contributor`,
  CREATE_TASK: `${PACKAGE_ID}::moveit::create_task`,
  UPDATE_TASK: `${PACKAGE_ID}::moveit::update_task`,
  UPDATE_TASK_STATUS: `${PACKAGE_ID}::moveit::update_task_status`,
  ASSIGN_TASK: `${PACKAGE_ID}::moveit::assign_task`,
  CREATE_SUBTASK: `${PACKAGE_ID}::moveit::create_subtask`,
} as const;