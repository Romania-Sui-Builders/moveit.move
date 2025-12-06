// app/boards/[boardId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCurrentAccount } from '@mysten/dapp-kit';
import {
  Heading,
  Text,
  Flex,
  Box,
  Container,
  Button,
  Badge,
  Separator,
  Tabs,
} from '@radix-ui/themes';
import {
  ArrowLeft,
  Plus,
  Users,
  CheckSquare,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { MemberManager } from '@/components/MemberManager';
import { useBoard } from '@/hooks/useBoard';
import { useCapabilities } from '@/hooks/useCapabilities';
import { truncateAddress, formatRelativeTime } from '@/utils/sui';

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const account = useCurrentAccount();
  const boardId = params.boardId as string;
  
  const { data: board } = useBoard(boardId);
  const { data: capabilities } = useCapabilities(boardId);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  if (!account) {
    return (
      <Container size="3" className="text-center py-16">
        <Heading size="6" mb="4">
          Connect Your Wallet
        </Heading>
        <Text color="gray">
          Please connect your wallet to view this board
        </Text>
      </Container>
    );
  }

  if (!board) {
    return (
      <Container size="3" className="py-16">
        <Box className="text-center space-y-4">
          <Heading size="6">Board not found</Heading>
          <Text color="gray">
            This board doesn&apos;t exist or you don&apos;t have permission to view it
          </Text>
          <Button
            variant="soft"
            onClick={() => router.push('/boards')}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Boards
          </Button>
        </Box>
      </Container>
    );
  }

  const isAdmin = capabilities?.some(cap => cap.type === 'admin');
  const isContributor = capabilities?.some(cap => cap.type === 'contributor') || isAdmin;
  const canCreateTasks = isContributor;
  const canManageMembers = isAdmin;

  return (
    <Container size="4">
      {/* Back Navigation */}
      <Button
        variant="ghost"
        onClick={() => router.push('/boards')}
        className="mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Boards
      </Button>

      {/* Board Header */}
      <Box className="space-y-6">
        <Box className="space-y-2">
          <Flex justify="between" align="start">
            <Heading size="8">{board.name}</Heading>
            {canCreateTasks && (
              <Button
                size="2"
                variant="solid"
                onClick={() => setShowCreateTask(true)}
                className="cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            )}
          </Flex>
          
          <Text size="3" color="gray">
            {board.description || 'No description'}
          </Text>
        </Box>

        {/* Board Stats */}
        <Flex gap="6">
          <Flex align="center" gap="2">
            <Users className="w-4 h-4 text-gray-11" />
            <Text size="2" color="gray">
              {board.memberCount} member{board.memberCount !== 1 ? 's' : ''}
            </Text>
          </Flex>
          
          <Flex align="center" gap="2">
            <Calendar className="w-4 h-4 text-gray-11" />
            <Text size="2" color="gray">
              Created {formatRelativeTime(board.createdAt)}
            </Text>
          </Flex>
          
          <Flex align="center" gap="2">
            <CheckSquare className="w-4 h-4 text-gray-11" />
            <Text size="2" color="gray">
              Owner: {truncateAddress(board.owner)}
            </Text>
          </Flex>
        </Flex>

        {/* Permission Badges */}
        <Flex gap="2">
          {isAdmin && (
            <Badge color="red">Admin</Badge>
          )}
          {isContributor && !isAdmin && (
            <Badge color="blue">Contributor</Badge>
          )}
          {!isContributor && !isAdmin && (
            <Badge color="gray">View Only</Badge>
          )}
          
          {isAdmin && (
            <Badge variant="soft" color="green">
              Can manage members
            </Badge>
          )}
          {isContributor && (
            <Badge variant="soft" color="blue">
              Can create tasks
            </Badge>
          )}
        </Flex>

        <Separator size="4" />

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </Tabs.Trigger>
            <Tabs.Trigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </Tabs.Trigger>
            <Tabs.Trigger value="settings">
              <MoreVertical className="w-4 h-4 mr-2" />
              Settings
            </Tabs.Trigger>
          </Tabs.List>

          <Box className="mt-6">
            <Tabs.Content value="tasks">
              <TaskList boardId={boardId} />
            </Tabs.Content>
            
            <Tabs.Content value="members">
              <MemberManager boardId={boardId} />
            </Tabs.Content>
            
            <Tabs.Content value="settings">
              <Box className="space-y-4">
                <Heading size="4">Board Settings</Heading>
                <Text color="gray">
                  Board settings coming soon...
                </Text>
              </Box>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Box>

      {/* Create Task Modal */}
      {showCreateTask && (
        <TaskForm
          boardId={boardId}
          onClose={() => setShowCreateTask(false)}
          onSuccess={() => {
            setShowCreateTask(false);
            // Refresh tasks
          }}
        />
      )}
    </Container>
  );
}