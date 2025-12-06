// app/api/boards/[boardId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dataService } from '@/services/data.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    
    if (!boardId) {
      return NextResponse.json(
        { error: 'Board ID is required' },
        { status: 400 }
      );
    }

    const board = await dataService.getBoard(boardId);

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ board }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
