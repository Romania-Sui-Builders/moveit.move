// components/TaskList.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  Flex,
  Button,
  Text,
  Badge,
  Box,
  Select,
  Tabs,
} from '@radix-ui/themes';
import {
  Filter,
  List,
  Grid3x3,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { TaskRow } from './TaskRow';
import { TaskCard } from './TaskCard';
import {
  getStatusText,
  getStatusColor,
  formatDate,
} from '@/utils/sui';
import type { TaskStatus } from '@/types/board';

interface TaskListProps {
  boardId: string;
}

export function TaskList({ boardId }: TaskListProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt' | 'status'>('dueDate');
  
  const { data: tasks, isLoading } = useTasks(boardId);

  const filteredTasks = tasks?.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  }) || [];

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return a.dueDate - b.dueDate;
      case 'createdAt':
        return b.createdAt - a.createdAt;
      case 'status':
        return a.status - b.status;
      default:
        return 0;
    }
  });

  const statusCounts = {
    all: tasks?.length || 0,
    [TaskStatus.TODO]: tasks?.filter(t => t.status === TaskStatus.TODO).length || 0,
    [TaskStatus.IN_PROGRESS]: tasks?.filter(t => t.status === TaskStatus.IN_PROGRESS).length || 0,
    [TaskStatus.DONE]: tasks?.filter(t => t.status === TaskStatus.DONE).length || 0,
  };

  return (
    <Box className="space-y-4">
      {/* Controls */}
      <Flex justify="between" align="center">
        <Flex gap="4" align="center">
          <Tabs.Root defaultValue="all">
            <Tabs.List>
              <Tabs.Trigger value="all">
                All ({statusCounts.all})
              </Tabs.Trigger>
              <Tabs.Trigger value="todo">
                To Do ({statusCounts[TaskStatus.TODO]})
              </Tabs.Trigger>
              <Tabs.Trigger value="inProgress">
                In Progress ({statusCounts[TaskStatus.IN_PROGRESS]})
              </Tabs.Trigger>
              <Tabs.Trigger value="done">
                Done ({statusCounts[TaskStatus.DONE]})
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </Flex>

        <Flex gap="2" align="center">
          <Select.Root value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <Select.Trigger>
              <Flex align="center" gap="2">
                <Filter className="w-4 h-4" />
                Sort by
                <ChevronDown className="w-4 h-4" />
              </Flex>
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="dueDate">Due Date</Select.Item>
              <Select.Item value="createdAt">Created Date</Select.Item>
              <Select.Item value="status">Status</Select.Item>
            </Select.Content>
          </Select.Root>

          <Flex gap="1">
            <Button
              variant={viewMode === 'list' ? 'solid' : 'soft'}
              size="1"
              onClick={() => setViewMode('list')}
              className="cursor-pointer"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'solid' : 'soft'}
              size="1"
              onClick={() => setViewMode('grid')}
              className="cursor-pointer"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </Flex>
        </Flex>
      </Flex>

      {/* Task List */}
      {isLoading ? (
        <Box className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Box key={i} className="h-12 bg-gray-3 rounded animate-pulse" />
          ))}
        </Box>
      ) : sortedTasks.length === 0 ? (
        <Box className="text-center py-12">
          <Text size="3" color="gray">
            No tasks yet. Create the first one!
          </Text>
        </Box>
      ) : viewMode === 'list' ? (
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Assignee</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Due Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Effort</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sortedTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </Table.Body>
        </Table.Root>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </Box>
  );
}