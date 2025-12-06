"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import { Button, TextField, TextArea, Flex, Text, Box } from "@radix-ui/themes";
import { Loader2, X } from "lucide-react";
import { useCreateBoard } from "@/hooks/useCreateBoard";

interface BoardFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function BoardForm({ onClose, onSuccess }: BoardFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createBoardMutation = useCreateBoard();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Board name is required";
    } else if (name.length > 100) {
      newErrors.name = "Board name must be 100 characters or less";
    }

    if (description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createBoardMutation.mutateAsync({
        name: name.trim(),
        description: description.trim(),
      });

      onSuccess();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const characterCount = {
    name: `${name.length}/100`,
    description: `${description.length}/500`,
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">
              Create New Board
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
            Create a new board to coordinate work with your team. All data will
            be stored on the Sui blockchain.
          </Text>
        </DialogDescription>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Box className="space-y-2">
            <Text as="label" size="2" weight="medium">
              Board Name *
            </Text>
            <TextField.Root
              placeholder="Enter board name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-red-7" : ""}
            />
            <Flex justify="between">
              <Text size="1" color={errors.name ? "red" : "gray"}>
                {errors.name || "Required, max 100 characters"}
              </Text>
              <Text size="1" color="gray">
                {characterCount.name}
              </Text>
            </Flex>
          </Box>

          <Box className="space-y-2">
            <Text as="label" size="2" weight="medium">
              Description
            </Text>
            <TextArea
              placeholder="Describe what this board is for"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`min-h-32 ${errors.description ? "border-red-7" : ""}`}
            />
            <Flex justify="between">
              <Text size="1" color={errors.description ? "red" : "gray"}>
                {errors.description || "Optional, max 500 characters"}
              </Text>
              <Text size="1" color="gray">
                {characterCount.description}
              </Text>
            </Flex>
          </Box>

          <Flex gap="3" justify="end" mt="6">
            <Button
              type="button"
              variant="soft"
              onClick={onClose}
              disabled={createBoardMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="solid"
              disabled={createBoardMutation.isPending || !name.trim()}
              className="cursor-pointer"
            >
              {createBoardMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Board"
              )}
            </Button>
          </Flex>
        </form>
      </DialogContent>
    </Dialog>
  );
}
