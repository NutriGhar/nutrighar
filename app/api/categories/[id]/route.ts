import { NextResponse } from 'next/server';
import { getCategoryById, updateCategory, deleteCategory } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// GET: Single Category
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await getCategoryById(id);

    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, data: category }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch category' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT: Update Category
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateCategory(id, body);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, data: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update category' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE: Delete Category
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteCategory(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete category' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
