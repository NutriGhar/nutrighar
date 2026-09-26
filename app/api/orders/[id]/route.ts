import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus } from '@/lib/db';

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

// GET: Single order details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, data: order }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500, headers: NO_CACHE_HEADERS }
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
      return NextResponse.json({ success: false, error: 'orderStatus is required' }, { status: 400, headers: NO_CACHE_HEADERS });
    }

    const updated = await updateOrderStatus(id, orderStatus, paymentStatus);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404, headers: NO_CACHE_HEADERS });
    }

    return NextResponse.json({ success: true, data: updated }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
