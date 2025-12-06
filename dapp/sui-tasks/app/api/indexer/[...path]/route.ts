// app/api/indexer/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL || 'http://localhost:3001';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/');
    const url = `${INDEXER_URL}/${path}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for real-time data
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Indexer request failed', details: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Indexer proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from indexer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
