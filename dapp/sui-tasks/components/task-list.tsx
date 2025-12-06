"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Circle, GripVertical } from "lucide-react"
import type { Task, Board } from "@/lib/types"
import { TaskForm } from "./task-form"
import { TaskDetail } from "./task-detail"
import { useSWRConfig } from "swr"
import useSWR from "swr"

interface TaskListProps {
  boardId: string
  tasks: Task[]
  board: Board
}

export function TaskList({ boardId, tasks: initialTasks, board }: TaskListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const { mutate } = useSWRConfig()

  const { data: tasks = initialTasks } = useSWR<Task[]>(`/api/tasks?boardId=${boardId}`, {
    fallbackData: initialTasks,
    refreshInterval: 3000, // Poll every 3 seconds for real-time updates
  })

  const columns = [...board.columns].sort((a, b) => a.order - b.order)

  const groupedTasks = columns.reduce(
    (acc, column) => {
      acc[column.id] = tasks.filter((t) => t.status === column.id)
      return acc
    },
    {} as Record<string, Task[]>,
  )

  const getPriorityColor = (priority: Task["priority"]) => {
    const colors = {
      urgent: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500",
    }
    return colors[priority]
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedTask || draggedTask.status === targetColumnId) {
      return
    }

    console.log("[v0] Moving task", draggedTask.id, "to column", targetColumnId)

    // Optimistic update
    const updatedTasks = tasks.map((t) => (t.id === draggedTask.id ? { ...t, status: targetColumnId } : t))

    // Update local state immediately
    mutate(`/api/tasks?boardId=${boardId}`, updatedTasks, false)

    // Send update to backend
    try {
      await fetch(`/api/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: draggedTask.id,
          status: targetColumnId,
        }),
      })

      // Revalidate to ensure consistency
      mutate(`/api/tasks?boardId=${boardId}`)
    } catch (error) {
      console.error("[v0] Failed to update task:", error)
      // Revert on error
      mutate(`/api/tasks?boardId=${boardId}`)
    }

    setDraggedTask(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} total tasks</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
      </div>

      {showCreateForm && <TaskForm boardId={boardId} board={board} onClose={() => setShowCreateForm(false)} />}

      {selectedTask && <TaskDetail task={selectedTask} board={board} onClose={() => setSelectedTask(null)} />}

      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(300px, 1fr))` }}>
        {columns.map((column) => {
          const isDropTarget = dragOverColumn === column.id
          return (
            <div
              key={column.id}
              className="space-y-3"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: column.color || "#64748b" }} />
                <h3 className="font-semibold">{column.name}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {groupedTasks[column.id]?.length || 0}
                </Badge>
              </div>

              <div
                className={`space-y-2 min-h-[100px] rounded-lg border-2 border-dashed p-2 transition-colors ${
                  isDropTarget ? "border-primary bg-primary/5" : "border-transparent"
                }`}
              >
                {(groupedTasks[column.id] || []).map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-move hover:shadow-md transition-all ${
                      draggedTask?.id === task.id ? "opacity-50" : ""
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
                          <span className="text-xs text-muted-foreground uppercase flex-shrink-0">{task.priority}</span>
                          {task.storyPoints && (
                            <Badge variant="outline" className="text-xs ml-auto flex-shrink-0">
                              {task.storyPoints} SP
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                      {task.description && (
                        <CardDescription className="text-xs line-clamp-2">{task.description}</CardDescription>
                      )}
                    </CardHeader>
                    {task.assignee && (
                      <CardContent className="p-4 pt-0">
                        <div className="text-xs text-muted-foreground font-mono truncate">{task.assignee}</div>
                      </CardContent>
                    )}
                  </Card>
                ))}

                {(groupedTasks[column.id]?.length || 0) === 0 && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    {isDropTarget ? "Drop here" : "No tasks"}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <Circle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-4">Create your first task to get started</p>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      )}
    </div>
  )
}
