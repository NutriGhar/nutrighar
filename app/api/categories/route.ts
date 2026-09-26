import { NextResponse } from 'next/server';
import { getCategories, createCategory } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// GET: Fetch all categories
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('all') === 'true';
    const categories = await getCategories(includeInactive);
    return NextResponse.json({ success: true, data: categories }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const newCategory = await createCategory({
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: body.description?.trim(),
      image: body.image,
      icon: body.icon || '📦',
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201, headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
