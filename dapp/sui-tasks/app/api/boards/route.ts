import { NextResponse } from "next/server"
import { dataService } from "@/services/data.service"

export async function GET() {
  try {
    const boards = await dataService.getBoards();
    return NextResponse.json({ boards }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch boards', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Board creation happens via blockchain transaction on the client
  // This endpoint is for future use or webhook handling
  return NextResponse.json(
    { error: 'Board creation must be done via blockchain transaction' },
    { status: 501 }
  );
}
