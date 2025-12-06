/*
  Warnings:

  - Added the required column `task_number` to the `TaskCreated` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add task_number with default for existing rows
ALTER TABLE "TaskCreated" ADD COLUMN "task_number" TEXT NOT NULL DEFAULT '0';

-- CreateTable
CREATE TABLE "SubtaskCreated" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "parent_task_id" TEXT NOT NULL,
    "subtask_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "creator" TEXT NOT NULL,

    CONSTRAINT "SubtaskCreated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "CommentAdded" (
    "dbId" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "comment_number" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "CommentAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubtaskCreated_dbId_key" ON "SubtaskCreated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentAdded_dbId_key" ON "CommentAdded"("dbId");
