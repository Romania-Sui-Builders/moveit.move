"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, ListTodo, LayoutGrid } from "lucide-react"
import { BoardForm } from "./board-form"
import Link from "next/link"
import { useBoards } from "@/hooks/useBoards"
import { useTasks } from "@/hooks/useTasks"

interface BoardListProps {
  selectedBoardId?: string | null
}

export function BoardList({ selectedBoardId }: BoardListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: boards = [], isLoading: boardsLoading } = useBoards()
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(selectedBoardId || undefined)

  const getTaskCount = (boardId: string) => {
    return tasks.filter((task) => task.boardId === boardId).length
  }

  const displayBoards = selectedBoardId ? boards.filter((board) => board.id === selectedBoardId) : boards

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedBoardId ? displayBoards[0]?.name || "Board" : "Your Boards"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {selectedBoardId ? displayBoards[0]?.description || "" : "Manage your tasks across different boards"}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Board
        </Button>
      </div>

      {showCreateForm && <BoardForm onClose={() => setShowCreateForm(false)} />}

      {selectedBoardId && displayBoards[0] ? (
        <div>
          <Link href={`/board/${selectedBoardId}`}>
            <Button variant="outline" className="mb-4 bg-transparent">
              View Full Board Details
            </Button>
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayBoards.map((board) => (
          <Link key={board.id} href={`/board/${board.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-xl">{board.name}</CardTitle>
                <CardDescription className="line-clamp-2">{board.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ListTodo className="h-4 w-4" />
                    <span>{getTaskCount(board.id)} tasks</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{board.memberCount} members</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {boards.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No boards yet</h3>
          <p className="text-muted-foreground mb-4">Create your first board to start managing tasks</p>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Board
          </Button>
        </div>
      )}
    </div>
  )
}
