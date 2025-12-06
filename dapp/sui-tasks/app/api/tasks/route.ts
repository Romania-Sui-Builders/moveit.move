import { NextResponse } from "next/server"
import { dataService } from "@/services/data.service"

// API route for tasks - queries indexer with blockchain fallback
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const boardId = searchParams.get("boardId")

    if (!boardId) {
      return NextResponse.json(
        { error: 'boardId is required' },
        { status: 400 }
      );
    }

    const tasks = await dataService.getTasks(boardId);
    return NextResponse.json({ tasks }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Task creation happens via blockchain transaction on the client
  // This endpoint is for future use or webhook handling
  return NextResponse.json(
    { error: 'Task creation must be done via blockchain transaction' },
    { status: 501 }
  );
}

export async function PATCH(request: Request) {
  // Task updates happen via blockchain transaction on the client
  // This endpoint is for future use or webhook handling
  return NextResponse.json(
    { error: 'Task updates must be done via blockchain transaction' },
    { status: 501 }
  );
}

export async function DELETE(request: Request) {
  // Task deletion is not supported in the current contract
  return NextResponse.json(
    { error: 'Task deletion not supported' },
    { status: 501 }
  );
}
