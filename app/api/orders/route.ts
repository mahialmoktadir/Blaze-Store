import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/src/db/queries.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const list = await getOrders({ userId });
    return NextResponse.json({ success: true, orders: list });
  } catch (error: any) {
    console.error('API GET /api/orders error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsapp,
      subtotal,
      discountAmount,
      totalAmount,
      paymentMethod,
      orderNotes,
      items,
    } = body;

    if (!customerName || !customerEmail || !customerWhatsapp || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer details or empty cart' },
        { status: 400 }
      );
    }

    const order = await createOrder({
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsapp,
      subtotal: parseFloat(subtotal),
      discountAmount: parseFloat(discountAmount || 0),
      totalAmount: parseFloat(totalAmount),
      paymentMethod,
      orderNotes,
      items,
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('API POST /api/orders error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
