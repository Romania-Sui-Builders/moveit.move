"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCreateBoard } from "@/hooks/useCreateBoard";
import { useBoards } from "@/hooks/useBoards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { ConnectionStatus } from "./connection-status";

/**
 * Example component demonstrating the complete Sui integration flow:
 * 1. Check wallet connection
 * 2. Read data from blockchain (boards)
 * 3. Write data to blockchain (create board)
 * 4. Handle loading and error states
 * 5. Auto-refresh data after mutation
 */
export function BoardManagementExample() {
  const account = useCurrentAccount();
  const { data: boards, isLoading, error, refetch } = useBoards();
  const {
    mutateAsync: createBoard,
    isPending,
    isError: createError,
  } = useCreateBoard();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      return;
    }

    try {
      await createBoard({ name, description });
      setName("");
      setDescription("");
      // Data will automatically refresh due to query invalidation
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Board Management</CardTitle>
          <CardDescription>
            Connect your wallet to manage boards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your Sui wallet to access board management
              features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectionStatus />
        </CardContent>
      </Card>

      {/* Create Board Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Board</CardTitle>
          <CardDescription>
            This will create a new board on the Sui blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBoard} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="board-name">Board Name</Label>
              <Input
                id="board-name"
                placeholder="My Project Board"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board-description">Description</Label>
              <Textarea
                id="board-description"
                placeholder="Describe your board..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                required
                rows={3}
              />
            </div>

            {createError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to create board. Please try again.
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Board...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Board
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Boards List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Boards</CardTitle>
              <CardDescription>
                Boards you own on the Sui blockchain
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load boards. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && boards && boards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No boards yet. Create your first board above!</p>
            </div>
          )}

          {!isLoading && !error && boards && boards.length > 0 && (
            <div className="space-y-3">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{board.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {board.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{board.memberCount} members</span>
                        <span>
                          Created{" "}
                          {new Date(board.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {board.id.slice(0, 8)}...
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
