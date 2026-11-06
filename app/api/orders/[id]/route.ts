import { NextResponse } from 'next/server';
import { getOrderDetails } from '@/src/db/queries.ts';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderDetails(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('API GET /api/orders/[id] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch order details' }, { status: 500 });
  }
}
