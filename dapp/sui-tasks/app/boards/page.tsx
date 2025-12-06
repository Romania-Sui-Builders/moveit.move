// app/boards/page.tsx
'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';
import {
  Heading,
  Text,
  Flex,
  Grid,
  Container,
  Button,
  Box,
  Skeleton,
} from '@radix-ui/themes';
import { Plus } from 'lucide-react';
import { BoardForm } from '@/components/BoardForm';
import { BoardCard } from '@/components/BoardCard';
import { useToast } from '@/hooks/useToast';
import { useBoards } from '@/hooks/useBoards';

export default function BoardsPage() {
  const account = useCurrentAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: boards, isLoading, refetch } = useBoards();
  const { toast } = useToast();

  const handleBoardCreated = () => {
    setShowCreateForm(false);
    refetch();
    toast('Board created!', 'Your board has been created successfully', 'success');
  };

  if (!account) {
    return (
      <Container size="3" className="text-center py-16">
        <Heading size="6" mb="4">
          Connect Your Wallet
        </Heading>
        <Text color="gray" mb="6">
          Please connect your wallet to view and manage boards
        </Text>
      </Container>
    );
  }

  return (
    <Container size="4">
      <Flex justify="between" align="center" mb="8">
        <Box>
          <Heading size="7" mb="2">
            My Boards
          </Heading>
          <Text color="gray">
            Manage your decentralized work coordination boards
          </Text>
        </Box>
        <Button
          size="3"
          variant="solid"
          className="cursor-pointer"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Board
        </Button>
      </Flex>

      {isLoading ? (
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </Grid>
      ) : boards?.length === 0 ? (
        <Container size="2" className="text-center py-16">
          <Box className="space-y-4">
            <Heading size="5" color="gray">
              No boards yet
            </Heading>
            <Text color="gray">
              Create your first board to start coordinating work on-chain
            </Text>
            <Button
              size="3"
              variant="solid"
              className="cursor-pointer mt-4"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </Box>
        </Container>
      ) : (
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          {boards?.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </Grid>
      )}

      {showCreateForm && (
        <BoardForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleBoardCreated}
        />
      )}
    </Container>
  );
}