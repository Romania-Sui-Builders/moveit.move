// Diagnostic script to validate Sui objects for task updates
// Run with: tsx diagnose-objects.ts

import { SuiClient } from '@mysten/sui/client';

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'testnet';

async function diagnoseObjects(
  boardId: string,
  taskId: string,
  contributorCapId: string
) {
  const client = new SuiClient({ 
    url: NETWORK === 'testnet' 
      ? 'https://fullnode.testnet.sui.io:443'
      : 'https://fullnode.devnet.sui.io:443'
  });

  console.log('🔍 Diagnosing Sui Objects');
  console.log('='.repeat(50));
  console.log(`Package ID: ${PACKAGE_ID}`);
  console.log(`Network: ${NETWORK}`);
  console.log('');

  // Check Board
  console.log('📋 Checking Board Object...');
  try {
    const board = await client.getObject({
      id: boardId,
      options: { showType: true, showOwner: true, showContent: true }
    });
    
    if (!board.data) {
      console.error('❌ Board not found!');
      return;
    }
    
    console.log(`✅ Board found`);
    console.log(`   Type: ${board.data.type}`);
    console.log(`   Owner: ${JSON.stringify(board.data.owner)}`);
    
    if (board.data.owner && 'Shared' in board.data.owner) {
      console.log(`   ✅ Board is a shared object (correct)`);
    } else {
      console.log(`   ⚠️  Board is NOT shared`);
    }
  } catch (error) {
    console.error('❌ Error fetching board:', error);
  }

  console.log('');

  // Check Task
  console.log('📝 Checking Task Object...');
  try {
    const task = await client.getObject({
      id: taskId,
      options: { showType: true, showOwner: true, showContent: true }
    });
    
    if (!task.data) {
      console.error('❌ Task not found!');
      console.error('   This task ID might be from a Table structure (not a separate object)');
      return;
    }
    
    console.log(`✅ Task found`);
    console.log(`   Type: ${task.data.type}`);
    console.log(`   Owner: ${JSON.stringify(task.data.owner)}`);
    
    if (task.data.owner && 'Shared' in task.data.owner) {
      console.log(`   ✅ Task is a shared object (correct for new boards)`);
    } else if (task.data.owner && 'AddressOwner' in task.data.owner) {
      console.log(`   ⚠️  Task is owned by an address`);
    } else if (task.data.owner && 'ObjectOwner' in task.data.owner) {
      console.log(`   ⚠️  Task is owned by another object (possibly in a Table)`);
    }
  } catch (error) {
    console.error('❌ Error fetching task:', error);
    console.error('   This confirms the task is NOT a separate shared object');
  }

  console.log('');

  // Check ContributorCap
  console.log('🎫 Checking ContributorCap Object...');
  try {
    const cap = await client.getObject({
      id: contributorCapId,
      options: { showType: true, showOwner: true, showContent: true }
    });
    
    if (!cap.data) {
      console.error('❌ ContributorCap not found!');
      return;
    }
    
    console.log(`✅ ContributorCap found`);
    console.log(`   Type: ${cap.data.type}`);
    console.log(`   Owner: ${JSON.stringify(cap.data.owner)}`);
    
    if (cap.data.owner && 'AddressOwner' in cap.data.owner) {
      console.log(`   ✅ ContributorCap is owned by an address (correct)`);
    } else {
      console.log(`   ⚠️  ContributorCap has unexpected ownership`);
    }
  } catch (error) {
    console.error('❌ Error fetching ContributorCap:', error);
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('💡 Diagnosis Summary:');
  console.log('   For update_task to work:');
  console.log('   1. Board must be a shared object ✅');
  console.log('   2. Task must be a separate shared object ⚠️ CHECK THIS');
  console.log('   3. ContributorCap must be owned by your address ✅');
  console.log('');
  console.log('   If Task is NOT found or NOT shared, your board uses');
  console.log('   the old Table structure and updates are not supported.');
}

// Example usage:
// diagnoseObjects(
//   '0x...board_id',
//   '0x...task_id',
//   '0x...contributor_cap_id'
// );

export { diagnoseObjects };
