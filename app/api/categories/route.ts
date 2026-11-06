import { NextResponse } from 'next/server';
import { getCategories } from '@/src/db/queries.ts';
import { db } from '@/src/db/index.ts';
import { categories } from '@/src/db/schema.ts';

export async function GET() {
  try {
    const list = await getCategories();
    return NextResponse.json({ success: true, categories: list });
  } catch (error: any) {
    console.error('API /api/categories error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, icon, description, sortOrder } = body;
    const [newCat] = await db
      .insert(categories)
      .values({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        icon: icon || 'Sparkles',
        description: description || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      })
      .returning();
    return NextResponse.json({ success: true, category: newCat });
  } catch (error: any) {
    console.error('API POST /api/categories error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
