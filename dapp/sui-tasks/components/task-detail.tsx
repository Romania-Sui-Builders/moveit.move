"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Pencil, Save, Trash2, Calendar } from "lucide-react"
import type { Task, Board } from "@/lib/types"

interface TaskDetailProps {
  task: Task
  board: Board
  onClose: () => void
}

export function TaskDetail({ task: initialTask, board, onClose }: TaskDetailProps) {
  const [task, setTask] = useState(initialTask)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [status, setStatus] = useState(task.status)
  const [assignee, setAssignee] = useState(task.assignee || "")
  const [storyPoints, setStoryPoints] = useState<number | "">(task.storyPoints || "")
  const [priority, setPriority] = useState(task.priority)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentColumn = board.columns.find((col) => col.id === task.status)

  const getPriorityVariant = (p: Task["priority"]) => {
    const variants = {
      urgent: "destructive",
      high: "default",
      medium: "secondary",
      low: "outline",
    }
    return variants[p] as "default" | "secondary" | "destructive" | "outline"
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedTask = {
      ...task,
      title,
      description,
      status,
      assignee: assignee || null,
      storyPoints: storyPoints || undefined,
      priority,
      updatedAt: Date.now(),
    }

    console.log("[v0] Updating task:", updatedTask)
    setTask(updatedTask)
    setIsSubmitting(false)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    setIsDeleting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("[v0] Deleting task:", task.id)
    onClose()
  }

  const handleCancel = () => {
    setTitle(task.title)
    setDescription(task.description)
    setStatus(task.status)
    setAssignee(task.assignee || "")
    setStoryPoints(task.storyPoints || "")
    setPriority(task.priority)
    setIsEditing(false)
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold h-auto py-2"
                required
              />
            ) : (
              <CardTitle className="text-2xl">{task.title}</CardTitle>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className="text-white" style={{ backgroundColor: currentColumn?.color || "#64748b" }}>
                {currentColumn?.name || task.status}
              </Badge>
              <Badge variant={getPriorityVariant(task.priority)}>{task.priority.toUpperCase()}</Badge>
              {task.storyPoints && (
                <Badge variant="outline">
                  {task.storyPoints} Story Point{task.storyPoints !== 1 ? "s" : ""}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                Created {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={handleDelete} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="task-description">Description</Label>
            {isEditing ? (
              <Textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-status">Status</Label>
              {isEditing ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {board.columns
                      .sort((a, b) => a.order - b.order)
                      .map((column) => (
                        <SelectItem key={column.id} value={column.id}>
                          {column.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center">
                  <Badge className="text-white" style={{ backgroundColor: currentColumn?.color || "#64748b" }}>
                    {currentColumn?.name || task.status}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Priority</Label>
              {isEditing ? (
                <Select value={priority} onValueChange={(value: typeof priority) => setPriority(value)}>
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 flex items-center">
                  <Badge variant={getPriorityVariant(task.priority)}>{task.priority.toUpperCase()}</Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assignee</Label>
              {isEditing ? (
                <Input
                  id="task-assignee"
                  placeholder="0x..."
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="font-mono"
                />
              ) : (
                <div className="h-10 flex items-center font-mono text-sm">
                  {task.assignee || <span className="text-muted-foreground">Unassigned</span>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-story-points">Story Points</Label>
              {isEditing ? (
                <Input
                  id="task-story-points"
                  type="number"
                  min="0"
                  placeholder="e.g., 5"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : "")}
                />
              ) : (
                <div className="h-10 flex items-center text-sm">
                  {task.storyPoints || <span className="text-muted-foreground">Not set</span>}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Details</Label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(task.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Updated: {new Date(task.updatedAt).toLocaleString()}</span>
              </div>
              <div className="col-span-2 font-mono text-xs">
                <span className="text-muted-foreground">Creator:</span> {task.creator}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
