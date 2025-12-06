"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Trash2 } from "lucide-react"
import { TaskList } from "./task-list"
import { MemberList } from "./member-list"
import { BoardSettings } from "./board-settings"
import Link from "next/link"
import { useRouter } from "next/navigation"
import useSWR from "swr"

interface BoardDetailProps {
  boardId: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  return data;
};

export function BoardDetail({ boardId }: BoardDetailProps) {
  const router = useRouter()
  const [showSettings, setShowSettings] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: boardData, error: boardError, isLoading: boardLoading } = useSWR(
    `/api/boards/${boardId}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const { data: tasksData, error: tasksError } = useSWR(
    `/api/boards/${boardId}/tasks`,
    fetcher,
    { refreshInterval: 3000 }
  )

  const board = boardData?.board
  const tasks = tasksData?.tasks || []

  if (boardLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    )
  }

  if (boardError || !board) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Board not found</h2>
        <p className="text-muted-foreground mb-4">This board does not exist or has been deleted</p>
        <Link href="/">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Boards
          </Button>
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("[v0] Deleting board:", boardId)
    router.push("/")
  }

  const handleUpdate = () => {
    // Board updates happen via blockchain transaction
    // This will trigger a re-fetch via SWR
    setShowSettings(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
            <p className="text-muted-foreground mt-1">{board.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)} className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="gap-2">
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {showSettings && <BoardSettings board={board} onUpdate={handleUpdate} onClose={() => setShowSettings(false)} />}

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-6">
          <TaskList boardId={boardId} tasks={tasks} board={board} />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <MemberList board={board} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
