import { SuiClient } from '@mysten/sui/client';

const clients: Record<string, SuiClient> = {
  mainnet: new SuiClient({ url: 'https://fullnode.mainnet.sui.io:443' }),
  testnet: new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' }),
  devnet: new SuiClient({ url: 'https://fullnode.devnet.sui.io:443' }),
};

export const getClient = (network: string): SuiClient => {
  const client = clients[network.toLowerCase()];
  if (!client) {
    throw new Error(`Invalid network: ${network}`);
  }
  return client;
};