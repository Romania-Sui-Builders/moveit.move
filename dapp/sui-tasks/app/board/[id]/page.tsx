"use client"

import { Header } from "@/components/header"
import { BoardDetail } from "@/components/board-detail"
import { use } from "react"

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <BoardDetail boardId={id} />
      </main>
    </div>
  )
}
