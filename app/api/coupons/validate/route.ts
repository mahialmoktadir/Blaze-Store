import { NextResponse } from 'next/server';
import { validateCoupon } from '@/src/db/queries.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });
    }

    const result = await validateCoupon(code, parseFloat(subtotal || 0));
    if (!result.isValid) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, coupon: result.coupon });
  } catch (error: any) {
    console.error('API /api/coupons/validate error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Coupon validation failed' }, { status: 500 });
  }
}
