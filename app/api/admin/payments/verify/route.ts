import { NextResponse } from 'next/server';
import { verifyPayment } from '@/src/db/queries.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submissionId, action, adminName, notes, rejectionReason } = body;

    if (!submissionId || !action) {
      return NextResponse.json({ success: false, error: 'Missing submission ID or action' }, { status: 400 });
    }

    const res = await verifyPayment(
      parseInt(submissionId),
      action,
      adminName || 'Admin MaHi',
      notes,
      rejectionReason
    );

    return NextResponse.json({ success: true, result: res });
  } catch (error: any) {
    console.error('API /api/admin/payments/verify error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}
