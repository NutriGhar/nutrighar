import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Single order details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { orderStatus, paymentStatus } = body;

    if (!orderStatus) {
      return NextResponse.json({ success: false, error: 'orderStatus is required' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, orderStatus, paymentStatus);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}
