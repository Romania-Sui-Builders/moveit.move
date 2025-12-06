// core/constants.ts
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '0xYOUR_PACKAGE_ID';
export const CLOCK_ID = '0x6'; // Sui Clock object

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';

export const EXPLORER_URL = 
  NETWORK === 'testnet' 
    ? 'https://suiexplorer.com/?network=testnet'
    : 'https://suiexplorer.com/?network=devnet';

export const BOARD_TYPE = `${PACKAGE_ID}::board::Board`;
export const TASK_TYPE = `${PACKAGE_ID}::task::Task`;
export const ADMIN_CAP_TYPE = `${PACKAGE_ID}::board::AdminCap`;
export const CONTRIBUTOR_CAP_TYPE = `${PACKAGE_ID}::board::ContributorCap`;