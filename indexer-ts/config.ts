import 'dotenv/config';

export const CONFIG = {
  NETWORK: process.env.NETWORK || 'mainnet',
  POLLING_INTERVAL_MS: parseInt(process.env.POLLING_INTERVAL_MS || '5000'),
  CONTRACT: {
    packageId: process.env.PACKAGE_ID || '',
  },
} as const;