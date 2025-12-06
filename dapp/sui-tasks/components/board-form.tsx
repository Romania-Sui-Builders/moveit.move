"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { useCreateBoard } from "@/hooks/useCreateBoard"

interface BoardFormProps {
  onClose: () => void
}

export function BoardForm({ onClose }: BoardFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const { mutateAsync: createBoard, isPending } = useCreateBoard()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createBoard({ name, description })
      onClose()
    } catch (error) {
      console.error("Failed to create board:", error)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Create New Board</CardTitle>
            <CardDescription>Set up a new board to organize your tasks</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Board Name</Label>
            <Input
              id="name"
              placeholder="e.g., Product Development"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this board for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Board"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
