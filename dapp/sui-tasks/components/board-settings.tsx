"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, GripVertical, Trash2 } from "lucide-react"
import type { Board, BoardColumn } from "@/lib/types"

interface BoardSettingsProps {
  board: Board
  onUpdate: (board: Board) => void
  onClose: () => void
}

export function BoardSettings({ board, onUpdate, onClose }: BoardSettingsProps) {
  const [name, setName] = useState(board.name)
  const [description, setDescription] = useState(board.description)
  const [columns, setColumns] = useState<BoardColumn[]>([...board.columns].sort((a, b) => a.order - b.order))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddColumn = () => {
    const newColumn: BoardColumn = {
      id: `col_${Date.now()}`,
      name: "New Column",
      order: columns.length,
      color: "#64748b",
    }
    setColumns([...columns, newColumn])
  }

  const handleUpdateColumn = (index: number, updates: Partial<BoardColumn>) => {
    const updated = [...columns]
    updated[index] = { ...updated[index], ...updates }
    setColumns(updated)
  }

  const handleDeleteColumn = (index: number) => {
    if (columns.length <= 1) {
      alert("You must have at least one column")
      return
    }
    const updated = columns.filter((_, i) => i !== index)
    // Reorder remaining columns
    updated.forEach((col, i) => {
      col.order = i
    })
    setColumns(updated)
  }

  const handleMoveColumn = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === columns.length - 1)) {
      return
    }
    const updated = [...columns]
    const swapIndex = direction === "up" ? index - 1 : index + 1
    ;[updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]]
    // Update order values
    updated.forEach((col, i) => {
      col.order = i
    })
    setColumns(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedBoard = {
      ...board,
      name,
      description,
      columns,
    }

    console.log("[v0] Updating board:", updatedBoard)
    onUpdate(updatedBoard)
    setIsSubmitting(false)
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Board Settings</CardTitle>
            <CardDescription>Update board details, columns, and members</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Board Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Board Columns</Label>
                <p className="text-sm text-muted-foreground">Configure workflow stages and their order</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddColumn}
                className="gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            </div>

            <div className="space-y-2">
              {columns.map((column, index) => (
                <div key={column.id} className="flex items-center gap-2 p-3 border rounded-lg bg-card">
                  <div className="flex flex-col gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveColumn(index, "up")}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleMoveColumn(index, "down")}
                      disabled={index === columns.length - 1}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Column name"
                      value={column.name}
                      onChange={(e) => handleUpdateColumn(index, { name: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={column.color || "#64748b"}
                        onChange={(e) => handleUpdateColumn(index, { color: e.target.value })}
                        className="w-20"
                      />
                      <Input
                        placeholder="ID"
                        value={column.id}
                        onChange={(e) => handleUpdateColumn(index, { id: e.target.value })}
                        className="font-mono text-xs flex-1"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteColumn(index)}
                    disabled={columns.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
