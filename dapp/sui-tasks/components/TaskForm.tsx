// components/TaskForm.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import {
  Button,
  TextField,
  TextArea,
  Flex,
  Text,
  Box,
  Select,
} from "@radix-ui/themes";
import { Loader2, X, Calendar, User } from "lucide-react";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { useToast } from "@/hooks/useToast";
import { isValidSuiAddress } from "@/utils/sui";
import type { Task, TaskStatus } from "@/types/board";

interface TaskFormProps {
  boardId: string;
  task?: Task;
  onClose: () => void;
  onSuccess: () => void;
}

export function TaskForm({ boardId, task, onClose, onSuccess }: TaskFormProps) {
  const isEditMode = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assignee, setAssignee] = useState(task?.assignee || "");
  const [status, setStatus] = useState<TaskStatus>(
    task?.status || TaskStatus.TODO
  );
  const [dueDate, setDueDate] = useState<string>(
    task ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [effortHours, setEffortHours] = useState<string>(
    task?.effortHours?.toString() || "0"
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTaskMutation = useCreateTask(boardId);
  const updateTaskMutation = useUpdateTask();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length > 200) {
      newErrors.title = "Title must be 200 characters or less";
    }

    if (description.length > 2000) {
      newErrors.description = "Description must be 2000 characters or less";
    }

    if (assignee && !isValidSuiAddress(assignee)) {
      newErrors.assignee = "Invalid Sui address format";
    }

    if (dueDate) {
      const selectedDate = new Date(dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    const hours = parseInt(effortHours);
    if (isNaN(hours) || hours < 0 || hours > 1000) {
      newErrors.effortHours = "Effort must be between 0 and 1000 hours";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isEditMode && task) {
        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          updates: {
            title: title.trim(),
            description: description.trim(),
            assignee: assignee.trim(),
            status,
            dueDate: dueDate
              ? Math.floor(new Date(dueDate).getTime())
              : Math.floor(Date.now() + 7 * 24 * 60 * 60 * 1000),
            effortHours: parseInt(effortHours),
          },
        });
      } else {
        await createTaskMutation.mutateAsync({
          title: title.trim(),
          description: description.trim(),
          assignee: assignee.trim(),
          status,
          dueDate: dueDate
            ? Math.floor(new Date(dueDate).getTime())
            : Math.floor(Date.now() + 7 * 24 * 60 * 60 * 1000),
          effortHours: parseInt(effortHours),
        });
      }

      onSuccess();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading =
    createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogTitle>
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">
              {isEditMode ? "Edit Task" : "Create New Task"}
            </Text>
            <Button
              variant="ghost"
              size="1"
              onClick={onClose}
              className="cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </Flex>
        </DialogTitle>

        <DialogDescription>
          <Text size="2" color="gray">
            {isEditMode
              ? "Update task details. All changes are recorded on-chain."
              : "Create a new task for your team. All data will be stored on the Sui blockchain."}
          </Text>
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Box className="space-y-2">
            <Text as="label" size="2" weight="medium">
              Title *
            </Text>
            <TextField.Root>
              <TextField.Input
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-red-7" : ""}
              />
            </TextField.Root>
            <Flex justify="between">
              <Text size="1" color={errors.title ? "red" : "gray"}>
                {errors.title || "Required, max 200 characters"}
              </Text>
              <Text size="1" color="gray">
                {title.length}/200
              </Text>
            </Flex>
          </Box>

          <Box className="space-y-2">
            <Text as="label" size="2" weight="medium">
              Description
            </Text>
            <TextArea
              placeholder="Describe the task in detail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`min-h-32 ${errors.description ? "border-red-7" : ""}`}
            />
            <Flex justify="between">
              <Text size="1" color={errors.description ? "red" : "gray"}>
                {errors.description || "Optional, max 2000 characters"}
              </Text>
              <Text size="1" color="gray">
                {description.length}/2000
              </Text>
            </Flex>
          </Box>

          <Grid columns="2" gap="4">
            <Box className="space-y-2">
              <Text as="label" size="2" weight="medium">
                Assignee
              </Text>
              <TextField.Root>
                <TextField.Slot>
                  <User className="w-4 h-4" />
                </TextField.Slot>
                <TextField.Input
                  placeholder="0x..."
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className={errors.assignee ? "border-red-7" : ""}
                />
              </TextField.Root>
              <Text size="1" color={errors.assignee ? "red" : "gray"}>
                {errors.assignee || "Optional, enter a Sui address"}
              </Text>
            </Box>

            <Box className="space-y-2">
              <Text as="label" size="2" weight="medium">
                Status
              </Text>
              <Select.Root
                value={status.toString()}
                onValueChange={(value) =>
                  setStatus(parseInt(value) as TaskStatus)
                }
              >
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value={TaskStatus.TODO.toString()}>
                    To Do
                  </Select.Item>
                  <Select.Item value={TaskStatus.IN_PROGRESS.toString()}>
                    In Progress
                  </Select.Item>
                  <Select.Item value={TaskStatus.DONE.toString()}>
                    Done
                  </Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box className="space-y-2">
              <Text as="label" size="2" weight="medium">
                Due Date
              </Text>
              <TextField.Root>
                <TextField.Slot>
                  <Calendar className="w-4 h-4" />
                </TextField.Slot>
                <TextField.Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={errors.dueDate ? "border-red-7" : ""}
                  min={new Date().toISOString().split("T")[0]}
                />
              </TextField.Root>
              <Text size="1" color={errors.dueDate ? "red" : "gray"}>
                {errors.dueDate || "Optional, cannot be in the past"}
              </Text>
            </Box>

            <Box className="space-y-2">
              <Text as="label" size="2" weight="medium">
                Effort (hours)
              </Text>
              <TextField.Root>
                <TextField.Input
                  type="number"
                  min="0"
                  max="1000"
                  value={effortHours}
                  onChange={(e) => setEffortHours(e.target.value)}
                  className={errors.effortHours ? "border-red-7" : ""}
                />
              </TextField.Root>
              <Text size="1" color={errors.effortHours ? "red" : "gray"}>
                {errors.effortHours || "Estimated hours (0-1000)"}
              </Text>
            </Box>
          </Grid>

          <Flex gap="3" justify="end" mt="6">
            <Button
              type="button"
              variant="soft"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              disabled={isLoading || !title.trim()}
              className="cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </Flex>
        </form>
      </DialogContent>
    </Dialog>
  );
}
