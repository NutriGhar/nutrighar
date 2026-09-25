import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';

// GET: Fetch orders with status filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const orders = await getOrders(status);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST: Create a new order (from customer checkout)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.addressLine1 || !body.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Customer information, delivery address, and ordered items are required.' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim(),
      customerPhone: body.customerPhone.trim(),
      addressLine1: body.addressLine1.trim(),
      addressLine2: body.addressLine2?.trim(),
      city: body.city?.trim() || 'Mumbai',
      state: body.state?.trim() || 'Maharashtra',
      postalCode: body.postalCode?.trim() || '400001',
      paymentStatus: body.paymentStatus || 'Paid',
      items: body.items.map((item: any) => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name,
        productPrice: Number(item.productPrice || item.price),
        productCategory: item.productCategory || item.category,
        productImage: item.productImage || item.image,
        quantity: Number(item.quantity) || 1,
      })),
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
