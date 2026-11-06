import { NextResponse } from 'next/server';
import { submitPayment } from '@/src/db/queries.ts';
import { validateTransactionId, normalizeBdPhone } from '@/lib/ecommerce-logic.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderNumber, paymentMethod, senderPhone, transactionId, amount, screenshotUrl } = body;

    if (!orderNumber || !paymentMethod || !senderPhone || !transactionId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Please provide all payment verification details.' },
        { status: 400 }
      );
    }

    // Validate TrxID format
    const trxValidation = validateTransactionId(transactionId, paymentMethod as any);
    if (!trxValidation.isValid) {
      return NextResponse.json(
        { success: false, error: trxValidation.error || 'Invalid Transaction ID' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneValidation = normalizeBdPhone(senderPhone);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, error: phoneValidation.error || 'Invalid sender phone number' },
        { status: 400 }
      );
    }

    const submission = await submitPayment({
      orderNumber,
      paymentMethod,
      senderPhone: phoneValidation.normalized,
      transactionId: trxValidation.formattedTrxId,
      amount: parseFloat(amount),
      screenshotUrl,
    });

    return NextResponse.json({
      success: true,
      submission,
      message:
        'Thank you for your order! Your payment information has been submitted successfully. Please wait while our team verifies your payment. Your digital product will be delivered through WhatsApp or Email. Please keep checking your WhatsApp and Email.',
    });
  } catch (error: any) {
    console.error('API POST /api/payments/submit error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit payment verification' },
      { status: 400 }
    );
  }
}
