import { NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';

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

// GET: Fetch single product
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, data: product }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT: Update product
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateProduct(id, {
      ...body,
      price: body.price !== undefined ? Number(body.price) : undefined,
      originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : undefined,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
      lowStockThreshold: body.lowStockThreshold !== undefined ? Number(body.lowStockThreshold) : undefined,
      ingredients: Array.isArray(body.ingredients)
        ? body.ingredients
        : typeof body.ingredients === 'string'
        ? body.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
      benefits: Array.isArray(body.benefits)
        ? body.benefits
        : typeof body.benefits === 'string'
        ? body.benefits.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, data: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE: Delete product
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
