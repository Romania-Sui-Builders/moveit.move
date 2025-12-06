"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockBoards, mockTasks } from "@/lib/mock-data"
import { Users, LayoutDashboard, CheckCircle2, TrendingUp, Clock, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"

export function AdminDashboard() {
  const { data: boards = mockBoards } = useSWR("/api/boards", {
    fallbackData: mockBoards,
    refreshInterval: 3000,
  })

  const { data: tasks = mockTasks } = useSWR("/api/tasks", {
    fallbackData: mockTasks,
    refreshInterval: 3000,
  })

  const totalBoards = boards.length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "done").length
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length
  const urgentTasks = tasks.filter((t) => t.priority === "urgent").length

  const allMembers = new Set(boards.flatMap((b) => b.members))
  const totalUsers = allMembers.size

  const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)
  const completedStoryPoints = tasks
    .filter((t) => t.status === "done")
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">System-wide analytics and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBoards}</div>
            <p className="text-xs text-muted-foreground">Active project boards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {completedStoryPoints}/{totalStoryPoints} story points
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Overview</CardTitle>
            <CardDescription>Distribution across all boards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <span className="text-2xl font-bold">{inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Completed</span>
              </div>
              <span className="text-2xl font-bold">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Urgent Priority</span>
              </div>
              <span className="text-2xl font-bold">{urgentTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Board Activity</CardTitle>
            <CardDescription>Recent updates across all boards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {boards.map((board) => {
                const boardTasks = tasks.filter((t) => t.boardId === board.id)
                const completed = boardTasks.filter((t) => t.status === "done").length
                const progress = boardTasks.length > 0 ? Math.round((completed / boardTasks.length) * 100) : 0

                return (
                  <div key={board.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{board.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {boardTasks.length} tasks
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">{progress}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
