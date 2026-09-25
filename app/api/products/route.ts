import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';

// GET: Fetch products with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;
    const isFeatured = searchParams.has('featured') ? searchParams.get('featured') === 'true' : undefined;
    const isBestSeller = searchParams.has('bestseller') ? searchParams.get('bestseller') === 'true' : undefined;
    const isActive = searchParams.has('active') ? searchParams.get('active') === 'true' : undefined;

    const products = await getProducts({
      categorySlug,
      categoryId,
      search,
      isFeatured,
      isBestSeller,
      isActive,
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Data Validation
    if (!body.name || !body.description || body.price === undefined || !body.categoryId || !body.image) {
      return NextResponse.json(
        { success: false, error: 'Product name, description, price, category, and image are required.' },
        { status: 400 }
      );
    }

    if (Number(body.price) < 0) {
      return NextResponse.json(
        { success: false, error: 'Price must be a positive number.' },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: body.name.trim(),
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: body.description.trim(),
      price: Number(body.price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      categoryId: body.categoryId,
      categorySlug: body.categorySlug || 'healthy-snacks',
      image: body.image,
      images: Array.isArray(body.images) ? body.images : [body.image],
      ingredients: Array.isArray(body.ingredients)
        ? body.ingredients
        : typeof body.ingredients === 'string'
        ? body.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      benefits: Array.isArray(body.benefits)
        ? body.benefits
        : typeof body.benefits === 'string'
        ? body.benefits.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [],
      rating: Number(body.rating) || 5.0,
      reviewCount: Number(body.reviewCount) || 0,
      stockQuantity: Number(body.stockQuantity) >= 0 ? Number(body.stockQuantity) : 50,
      lowStockThreshold: Number(body.lowStockThreshold) >= 0 ? Number(body.lowStockThreshold) : 10,
      isFeatured: Boolean(body.isFeatured),
      isBestSeller: Boolean(body.isBestSeller),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
