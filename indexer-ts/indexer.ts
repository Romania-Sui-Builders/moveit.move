import { setupListeners } from './indexer/event-indexer';

async function main() {
  await setupListeners();
}

main().catch(console.error);