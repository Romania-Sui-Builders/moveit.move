import { NextResponse } from "next/server"
import { mockBoards } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockBoards)
}

export async function POST(request: Request) {
  const body = await request.json()

  // Mock board creation - will be replaced with blockchain transaction
  const newBoard = {
    id: String(mockBoards.length + 1),
    name: body.name,
    description: body.description,
    owner: body.owner,
    members: [body.owner],
    taskIds: [],
    createdAt: Date.now(),
  }

  console.log("[v0] API: Creating board", newBoard)

  return NextResponse.json({ board: newBoard })
}
