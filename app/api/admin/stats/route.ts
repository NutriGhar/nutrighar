import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const stats = await getAdminStats();
    return NextResponse.json({ success: true, data: stats }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to calculate stats' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
