// components/TaskRow.tsx
"use client";

import { useState } from "react";
import { Badge, Table, Text } from "@radix-ui/themes";
import { Clock, User } from "lucide-react";
import { TaskForm } from "./TaskForm";
import {
  getStatusText,
  getStatusColor,
  formatDate,
  truncateAddress,
} from "@/utils/sui";
import { Task, TaskStatus } from "@/types/board";

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  const isOverdue =
    task.status !== TaskStatus.DONE && task.dueDate < Date.now();

  const handleRowClick = () => {
    setShowEditForm(true);
  };

  return (
    <>
      <Table.Row
        className="cursor-pointer hover:bg-gray-3"
        onClick={handleRowClick}
      >
        <Table.RowHeaderCell>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full bg-${getStatusColor(task.status)}-9`}
            />
            <span className="font-medium">{task.title}</span>
          </div>
        </Table.RowHeaderCell>

        <Table.Cell>
          <Badge color={getStatusColor(task.status) as any} variant="soft">
            {getStatusText(task.status)}
          </Badge>
        </Table.Cell>

        <Table.Cell>
          {task.assignee ? (
            <div className="flex items-center gap-2">
              <User className="w-3 h-3" />
              {truncateAddress(task.assignee)}
            </div>
          ) : (
            <Text color="gray" size="2">
              Unassigned
            </Text>
          )}
        </Table.Cell>

        <Table.Cell>
          <div className="flex items-center gap-2">
            <Clock
              className={`w-3 h-3 ${isOverdue ? "text-red-9" : "text-gray-11"}`}
            />
            <Text color={isOverdue ? "red" : "gray"} size="2">
              {isOverdue ? "Overdue - " : ""}
              {formatDate(task.dueDate)}
            </Text>
          </div>
        </Table.Cell>

        <Table.Cell>
          <Text size="2">{task.effortHours}h</Text>
        </Table.Cell>
      </Table.Row>

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
