import { NextResponse } from "next/server"
import { mockTasks } from "@/lib/mock-data"

// Mock API route for tasks - will be replaced with blockchain queries
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const boardId = searchParams.get("boardId")

  if (boardId) {
    const tasks = mockTasks.filter((task) => task.boardId === boardId)
    return NextResponse.json(tasks)
  }

  return NextResponse.json(mockTasks)
}

export async function POST(request: Request) {
  const body = await request.json()

  // Mock task creation - will be replaced with blockchain transaction
  const newTask = {
    id: String(mockTasks.length + 1),
    boardId: body.boardId,
    title: body.title,
    description: body.description,
    status: body.status || "todo",
    assignee: body.assignee || null,
    creator: body.creator,
    priority: body.priority || "medium",
    storyPoints: body.storyPoints || null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  console.log("[v0] API: Creating task", newTask)

  return NextResponse.json(newTask)
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { taskId, status, priority, storyPoints, title, description, assignee } = body

  // Mock task update - will be replaced with blockchain transaction
  const taskIndex = mockTasks.findIndex((t) => t.id === taskId)

  if (taskIndex === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  // Update the task
  mockTasks[taskIndex] = {
    ...mockTasks[taskIndex],
    ...(status !== undefined && { status }),
    ...(priority !== undefined && { priority }),
    ...(storyPoints !== undefined && { storyPoints }),
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(assignee !== undefined && { assignee }),
    updatedAt: Date.now(),
  }

  console.log("[v0] API: Updated task", taskId, "with changes:", body)

  return NextResponse.json(mockTasks[taskIndex])
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get("taskId")

  if (!taskId) {
    return NextResponse.json({ error: "Task ID required" }, { status: 400 })
  }

  const taskIndex = mockTasks.findIndex((t) => t.id === taskId)

  if (taskIndex === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 })
  }

  mockTasks.splice(taskIndex, 1)
  console.log("[v0] API: Deleted task", taskId)

  return NextResponse.json({ success: true })
}
