// app/api/boards/[boardId]/tasks/[taskId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/data.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string; taskId: string }> }
) {
  try {
    const { boardId, taskId } = await params;
    
    if (!boardId || !taskId) {
      return NextResponse.json(
        { error: 'Board ID and Task ID are required' },
        { status: 400 }
      );
    }

    const task = await dataService.getTask(boardId, parseInt(taskId));

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
