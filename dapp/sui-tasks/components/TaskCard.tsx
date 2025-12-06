// components/TaskCard.tsx
'use client';

import { useState } from 'react';
import {
  Card,
  Heading,
  Text,
  Flex,
  Badge,
  Box,
} from '@radix-ui/themes';
import {
  Clock,
  User,
  AlertCircle,
  Edit,
  CheckCircle,
  PlayCircle,
} from 'lucide-react';
import { TaskForm } from './TaskForm';
import {
  getStatusText,
  getStatusColor,
  formatDate,
  truncateAddress,
} from '@/utils/sui';
import type { Task } from '@/types/board';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  
  const isOverdue = task.status !== TaskStatus.DONE && task.dueDate < Date.now();
  
  const statusIcon = {
    [TaskStatus.TODO]: <AlertCircle className="w-4 h-4" />,
    [TaskStatus.IN_PROGRESS]: <PlayCircle className="w-4 h-4" />,
    [TaskStatus.DONE]: <CheckCircle className="w-4 h-4" />,
  };

  const handleCardClick = () => {
    setShowEditForm(true);
  };

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
        onClick={handleCardClick}
      >
        <Box className="space-y-3">
          <Flex justify="between" align="start">
            <Heading size="3" className="line-clamp-1 flex-1">
              {task.title}
            </Heading>
            <Badge
              color={getStatusColor(task.status) as any}
              variant="soft"
              className="flex items-center gap-1"
            >
              {statusIcon[task.status]}
              {getStatusText(task.status)}
            </Badge>
          </Flex>

          <Text size="2" color="gray" className="line-clamp-2">
            {task.description || 'No description'}
          </Text>

          <Flex gap="3" align="center">
            <Flex align="center" gap="1">
              <User className="w-3 h-3 text-gray-11" />
              <Text size="1" color="gray">
                {task.assignee ? truncateAddress(task.assignee) : 'Unassigned'}
              </Text>
            </Flex>

            <Flex align="center" gap="1">
              <Clock className={`w-3 h-3 ${isOverdue ? 'text-red-9' : 'text-gray-11'}`} />
              <Text size="1" color={isOverdue ? 'red' : 'gray'}>
                {isOverdue ? 'Overdue' : formatDate(task.dueDate)}
              </Text>
            </Flex>
          </Flex>

          <Flex justify="between" align="center">
            <Text size="1" color="gray">
              {task.effortHours} hours
            </Text>
            <Badge variant="outline" size="1">
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Badge>
          </Flex>
        </Box>
      </Card>

      {showEditForm && (
        <TaskForm
          boardId={task.boardId}
          task={task}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            // Refresh tasks
          }}
        />
      )}
    </>
  );
}