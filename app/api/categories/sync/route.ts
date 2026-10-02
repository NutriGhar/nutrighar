import { NextResponse } from 'next/server';
import { syncOfficialCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    const updatedCategories = await syncOfficialCategories();
    return NextResponse.json({
      success: true,
      message: 'Categories successfully synced with official NutriGhar banners and icons.',
      data: updatedCategories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync categories' },
      { status: 500 }
    );
  }
}
