"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Board, Task } from "@/lib/types"
import { CheckCircle2, Clock, ListTodo, Target } from "lucide-react"
import useSWR from "swr"
import { mockTasks } from "@/lib/mock-data"

interface UserAnalyticsProps {
  boards: Board[]
  tasks: Task[]
}

export function UserAnalytics({ boards, tasks: initialTasks }: UserAnalyticsProps) {
  const { data: allTasks = mockTasks } = useSWR("/api/tasks", {
    fallbackData: mockTasks,
    refreshInterval: 3000,
  })

  const tasks = initialTasks

  const completedTasks = tasks.filter((t) => t.status === "done")
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress")
  const totalStoryPoints = tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)
  const completedStoryPoints = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)

  const priorityCounts = {
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    high: tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low: tasks.filter((t) => t.priority === "low").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your progress and task statistics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boards.length}</div>
            <p className="text-xs text-muted-foreground">Boards you're a member of</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">{completedTasks.length} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Story Points</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedStoryPoints}/{totalStoryPoints}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0}% completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution of your assigned tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="w-16 justify-center">
                  Urgent
                </Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.urgent}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="w-16 justify-center bg-orange-500">High</Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-16 justify-center">
                  Medium
                </Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-16 justify-center">
                  Low
                </Badge>
                <span className="text-sm text-muted-foreground">tasks</span>
              </div>
              <span className="text-2xl font-bold">{priorityCounts.low}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest task updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, 5)
                .map((task) => (
                  <div key={task.id} className="flex items-start gap-3">
                    <CheckCircle2
                      className={`h-4 w-4 mt-1 ${task.status === "done" ? "text-green-500" : "text-muted-foreground"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(task.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
