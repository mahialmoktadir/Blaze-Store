import { NextResponse } from 'next/server';
import { syncUser } from '@/src/db/queries.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { uid, email, name, phone } = body;

    if (!uid || !email) {
      return NextResponse.json({ success: false, error: 'UID and email required' }, { status: 400 });
    }

    const user = await syncUser(uid, email, name, phone);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('API /api/auth/sync error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to sync user' }, { status: 500 });
  }
}
