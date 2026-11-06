import { NextResponse } from 'next/server';
import { getProductBySlug } from '@/src/db/queries.ts';
import { db } from '@/src/db/index.ts';
import { products, productVariations, reviews } from '@/src/db/schema.ts';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const item = await getProductBySlug(slug);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: item });
  } catch (error: any) {
    console.error('API /api/products/[slug] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const existing = await db.select().from(products).where(eq(products.slug, slug));
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    const prodId = existing[0].id;
    // Delete related variations and reviews
    await db.delete(productVariations).where(eq(productVariations.productId, prodId));
    await db.delete(reviews).where(eq(reviews.productId, prodId));
    await db.delete(products).where(eq(products.id, prodId));

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    console.error('API DELETE /api/products/[slug] error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
