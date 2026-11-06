import { NextResponse } from 'next/server';
import { deliverOrder } from '@/src/db/queries.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, deliveryInfo, adminName } = body;

    if (!orderId || !deliveryInfo) {
      return NextResponse.json({ success: false, error: 'Missing order ID or delivery information' }, { status: 400 });
    }

    const updated = await deliverOrder(parseInt(orderId), deliveryInfo, adminName || 'Admin MaHi');
    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('API /api/admin/orders/deliver error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Delivery fulfillment failed' }, { status: 500 });
  }
}
