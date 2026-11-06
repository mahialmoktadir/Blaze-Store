import { NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/src/db/queries.ts';

export async function GET() {
  try {
    const data = await getSettings();
    return NextResponse.json({ success: true, settings: data });
  } catch (error: any) {
    console.error('API GET /api/settings error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settings, adminName } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid settings object' }, { status: 400 });
    }

    const res = await updateSettings(settings, adminName || 'Admin MaHi');
    return NextResponse.json({ success: true, result: res });
  } catch (error: any) {
    console.error('API POST /api/settings error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
