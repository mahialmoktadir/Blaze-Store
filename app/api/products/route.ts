import { NextResponse } from 'next/server';
import { getProducts } from '@/src/db/queries.ts';
import { db } from '@/src/db/index.ts';
import { products, productVariations } from '@/src/db/schema.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined;
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('q') || undefined;

    const items = await getProducts({
      categoryId,
      featuredOnly: featured,
      search,
    });

    return NextResponse.json({ success: true, products: items });
  } catch (error: any) {
    console.error('API /api/products error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      thumbnail,
      categoryId,
      regularPrice,
      discountPrice,
      subscriptionDuration,
      productType,
      stockQuantity,
      deliveryMethod,
      deliveryInstructions,
      isFeatured,
      isTrending,
      variations,
    } = body;

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        shortDescription: shortDescription || null,
        thumbnail,
        categoryId: categoryId ? parseInt(categoryId) : null,
        regularPrice: regularPrice.toString(),
        discountPrice: discountPrice ? discountPrice.toString() : null,
        subscriptionDuration: subscriptionDuration || '1 Month',
        productType: productType || 'subscription',
        stockQuantity: stockQuantity ? parseInt(stockQuantity) : 100,
        deliveryMethod: deliveryMethod || 'manual_delivery',
        deliveryInstructions: deliveryInstructions || null,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        status: 'active',
      })
      .returning();

    // Insert variations if provided
    if (Array.isArray(variations) && variations.length > 0) {
      for (const v of variations) {
        await db.insert(productVariations).values({
          productId: newProduct.id,
          name: v.name,
          duration: v.duration || '1 Month',
          price: v.price.toString(),
          regularPrice: v.regularPrice ? v.regularPrice.toString() : null,
          isDefault: Boolean(v.isDefault),
        });
      }
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('API POST /api/products error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
