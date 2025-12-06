-- CreateTable
CREATE TABLE "BoardCreated" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "version" TEXT NOT NULL,

    CONSTRAINT "BoardCreated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "BoardMigrated" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "old_version" TEXT NOT NULL,
    "new_version" TEXT NOT NULL,
    "migrated_by" TEXT NOT NULL,

    CONSTRAINT "BoardMigrated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "ContributorAdded" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "contributor" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "ContributorAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "StatusAdded" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "added_by" TEXT NOT NULL,

    CONSTRAINT "StatusAdded_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "StatusRemoved" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "removed_by" TEXT NOT NULL,

    CONSTRAINT "StatusRemoved_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskAssigned" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "assignees" TEXT[],
    "assigned_by" TEXT NOT NULL,

    CONSTRAINT "TaskAssigned_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskCreated" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "creator" TEXT NOT NULL,

    CONSTRAINT "TaskCreated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskStatusChanged" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "old_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,

    CONSTRAINT "TaskStatusChanged_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "TaskUpdated" (
    "dbId" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "TaskUpdated_pkey" PRIMARY KEY ("dbId")
);

-- CreateTable
CREATE TABLE "cursor" (
    "id" TEXT NOT NULL,
    "eventSeq" TEXT NOT NULL,
    "txDigest" TEXT NOT NULL,

    CONSTRAINT "cursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BoardCreated_dbId_key" ON "BoardCreated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMigrated_dbId_key" ON "BoardMigrated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "ContributorAdded_dbId_key" ON "ContributorAdded"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "StatusAdded_dbId_key" ON "StatusAdded"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "StatusRemoved_dbId_key" ON "StatusRemoved"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskAssigned_dbId_key" ON "TaskAssigned"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCreated_dbId_key" ON "TaskCreated"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskStatusChanged_dbId_key" ON "TaskStatusChanged"("dbId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskUpdated_dbId_key" ON "TaskUpdated"("dbId");
