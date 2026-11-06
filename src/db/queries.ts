import { db } from './index.ts';
import {
  users,
  categories,
  products,
  productVariations,
  productKeys,
  orders,
  orderItems,
  paymentSubmissions,
  coupons,
  supportTickets,
  supportMessages,
  reviews,
  settings,
  activityLogs,
} from './schema.ts';
import { eq, desc, and, like, or, sql } from 'drizzle-orm';

// --- Users ---
export async function syncUser(uid: string, email: string, name?: string, phone?: string) {
  try {
    const isMahiAdmin = email.toLowerCase().includes('mahi') || email.toLowerCase().includes('mrmahirajkumar143@gmail.com');
    const role = isMahiAdmin ? 'admin' : 'customer';

    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      const updated = await db
        .update(users)
        .set({
          email,
          name: name || existing[0].name,
          phone: phone || existing[0].phone,
          role: existing[0].role === 'admin' ? 'admin' : role,
        })
        .where(eq(users.uid, uid))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(users)
        .values({
          uid,
          email,
          name: name || email.split('@')[0],
          phone: phone || null,
          role,
        })
        .returning();
      return inserted[0];
    }
  } catch (err) {
    console.error('Error syncing user:', err);
    throw new Error('Failed to synchronize user account', { cause: err });
  }
}

// --- Categories ---
export async function getCategories() {
  try {
    return await db.select().from(categories).orderBy(categories.sortOrder, categories.name);
  } catch (err) {
    console.error('Error fetching categories:', err);
    throw new Error('Failed to fetch categories', { cause: err });
  }
}

// --- Products ---
export async function getProducts(options?: {
  categoryId?: number;
  featuredOnly?: boolean;
  search?: string;
  limit?: number;
}) {
  try {
    let query = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        thumbnail: products.thumbnail,
        categoryId: products.categoryId,
        regularPrice: products.regularPrice,
        discountPrice: products.discountPrice,
        subscriptionDuration: products.subscriptionDuration,
        productType: products.productType,
        stockQuantity: products.stockQuantity,
        deliveryMethod: products.deliveryMethod,
        deliveryInstructions: products.deliveryInstructions,
        isFeatured: products.isFeatured,
        isTrending: products.isTrending,
        status: products.status,
        createdAt: products.createdAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    const conditions = [];

    if (options?.categoryId) {
      conditions.push(eq(products.categoryId, options.categoryId));
    }
    if (options?.featuredOnly) {
      conditions.push(eq(products.isFeatured, true));
    }
    if (options?.search) {
      conditions.push(
        or(
          like(products.name, `%${options.search}%`),
          like(products.description, `%${options.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      // @ts-expect-error Drizzle multiple where builder
      query = query.where(and(...conditions));
    }

    const items = await query.orderBy(desc(products.isFeatured), desc(products.createdAt));

    // Also get all variations for these products
    const variations = await db.select().from(productVariations);

    return items.map((p) => ({
      ...p,
      variations: variations.filter((v) => v.productId === p.id),
    }));
  } catch (err) {
    console.error('Error fetching products:', err);
    throw new Error('Failed to fetch products', { cause: err });
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const list = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        thumbnail: products.thumbnail,
        categoryId: products.categoryId,
        regularPrice: products.regularPrice,
        discountPrice: products.discountPrice,
        subscriptionDuration: products.subscriptionDuration,
        productType: products.productType,
        stockQuantity: products.stockQuantity,
        deliveryMethod: products.deliveryMethod,
        deliveryInstructions: products.deliveryInstructions,
        isFeatured: products.isFeatured,
        isTrending: products.isTrending,
        status: products.status,
        createdAt: products.createdAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug));

    if (list.length === 0) return null;
    const prod = list[0];

    const variations = await db
      .select()
      .from(productVariations)
      .where(eq(productVariations.productId, prod.id));

    const reviewsList = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, prod.id), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));

    return {
      ...prod,
      variations,
      reviews: reviewsList,
    };
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    throw new Error('Failed to fetch product details', { cause: err });
  }
}

// --- Orders ---
export async function createOrder(data: {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerWhatsapp: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  orderNotes?: string;
  items: Array<{
    productId: number;
    variationId?: number;
    productName: string;
    variationName?: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}) {
  try {
    // Generate unique order number: BLZ-YYYY-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `BLZ-${new Date().getFullYear()}-${randomHex}`;

    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: data.userId || 'guest',
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || null,
        customerWhatsapp: data.customerWhatsapp,
        subtotal: data.subtotal.toString(),
        discountAmount: data.discountAmount.toString(),
        totalAmount: data.totalAmount.toString(),
        paymentMethod: data.paymentMethod,
        paymentStatus: 'awaiting_payment',
        fulfillmentStatus: 'pending',
        orderNotes: data.orderNotes || null,
      })
      .returning();

    // Insert items
    for (const item of data.items) {
      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: item.productId,
        variationId: item.variationId || null,
        productName: item.productName,
        variationName: item.variationName || null,
        price: item.price.toString(),
        quantity: item.quantity,
        total: item.total.toString(),
      });
    }

    return newOrder;
  } catch (err) {
    console.error('Error creating order:', err);
    throw new Error('Failed to create order in database', { cause: err });
  }
}

export async function getOrderDetails(orderIdentifier: string) {
  try {
    // Check if numeric ID or orderNumber (e.g. BLZ-...)
    const condition = !isNaN(Number(orderIdentifier))
      ? eq(orders.id, Number(orderIdentifier))
      : eq(orders.orderNumber, orderIdentifier.trim().toUpperCase());

    const orderList = await db.select().from(orders).where(condition);
    if (orderList.length === 0) return null;
    const order = orderList[0];

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));

    const submissions = await db
      .select()
      .from(paymentSubmissions)
      .where(eq(paymentSubmissions.orderId, order.id))
      .orderBy(desc(paymentSubmissions.createdAt));

    return {
      ...order,
      items,
      submissions,
    };
  } catch (err) {
    console.error('Error getting order details:', err);
    throw new Error('Failed to fetch order details', { cause: err });
  }
}

export async function getOrders(options?: { userId?: string; limit?: number }) {
  try {
    let q = db.select().from(orders);
    if (options?.userId && options.userId !== 'all') {
      // @ts-expect-error drizzle builder
      q = q.where(eq(orders.userId, options.userId));
    }
    const list = await q.orderBy(desc(orders.createdAt));

    const allItems = await db.select().from(orderItems);
    const allSubs = await db.select().from(paymentSubmissions);

    return list.map((o) => ({
      ...o,
      items: allItems.filter((it) => it.orderId === o.id),
      submissions: allSubs.filter((s) => s.orderId === o.id),
    }));
  } catch (err) {
    console.error('Error fetching orders:', err);
    throw new Error('Failed to list orders', { cause: err });
  }
}

// --- Payment Submissions ---
export async function submitPayment(data: {
  orderNumber: string;
  paymentMethod: string;
  senderPhone: string;
  transactionId: string;
  amount: number;
  screenshotUrl?: string;
}) {
  try {
    const formattedTrx = data.transactionId.trim().toUpperCase();

    // Prevent duplicate TrxID
    const existing = await db
      .select()
      .from(paymentSubmissions)
      .where(eq(paymentSubmissions.transactionId, formattedTrx));

    if (existing.length > 0) {
      throw new Error(`Transaction ID '${formattedTrx}' has already been submitted for verification.`);
    }

    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, data.orderNumber.trim().toUpperCase()));

    if (orderList.length === 0) {
      throw new Error(`Order ${data.orderNumber} not found.`);
    }

    const order = orderList[0];

    // Insert submission
    const [submission] = await db
      .insert(paymentSubmissions)
      .values({
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: data.paymentMethod,
        senderPhone: data.senderPhone,
        transactionId: formattedTrx,
        amount: data.amount.toString(),
        screenshotUrl: data.screenshotUrl || null,
        status: 'under_verification',
      })
      .returning();

    // Update order status to payment_submitted / under_verification
    await db
      .update(orders)
      .set({
        paymentStatus: 'under_verification',
        fulfillmentStatus: 'processing',
      })
      .where(eq(orders.id, order.id));

    return submission;
  } catch (err: unknown) {
    console.error('Error in submitPayment:', err);
    throw err instanceof Error ? err : new Error('Failed to submit payment details');
  }
}

// --- Payment Verification & Digital Delivery ---
export async function verifyPayment(
  submissionId: number,
  action: 'verify' | 'reject',
  adminName: string,
  notes?: string,
  rejectionReason?: string
) {
  try {
    const subs = await db
      .select()
      .from(paymentSubmissions)
      .where(eq(paymentSubmissions.id, submissionId));

    if (subs.length === 0) throw new Error('Payment submission not found');
    const submission = subs[0];

    const order = (
      await db.select().from(orders).where(eq(orders.id, submission.orderId))
    )[0];

    if (action === 'verify') {
      await db
        .update(paymentSubmissions)
        .set({
          status: 'payment_verified',
          adminNotes: notes || 'Verified by admin',
          verifiedAt: new Date(),
        })
        .where(eq(paymentSubmissions.id, submissionId));

      // Check if there are unused keys for this order's items
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));

      let autoDeliveryInfo = '';
      for (const item of items) {
        // Find an unused license key if available
        const unusedKeys = await db
          .select()
          .from(productKeys)
          .where(
            and(
              eq(productKeys.productId, item.productId),
              eq(productKeys.isUsed, false)
            )
          )
          .limit(1);

        if (unusedKeys.length > 0) {
          const keyItem = unusedKeys[0];
          await db
            .update(productKeys)
            .set({ isUsed: true, orderId: order.id })
            .where(eq(productKeys.id, keyItem.id));

          autoDeliveryInfo += `[${item.productName}] Key/Access: ${keyItem.licenseKey || keyItem.accountCredentials}\n`;
        }
      }

      await db
        .update(orders)
        .set({
          paymentStatus: 'payment_verified',
          fulfillmentStatus: autoDeliveryInfo ? 'delivered' : 'confirmed',
          deliveryInfo: autoDeliveryInfo ? autoDeliveryInfo : order.deliveryInfo,
          deliveredAt: autoDeliveryInfo ? new Date() : null,
        })
        .where(eq(orders.id, order.id));

      // Log activity
      await db.insert(activityLogs).values({
        adminName,
        action: 'VERIFY_PAYMENT',
        details: `Verified payment for ${order.orderNumber} (TrxID: ${submission.transactionId})`,
      });
    } else {
      // Rejection
      await db
        .update(paymentSubmissions)
        .set({
          status: 'payment_rejected',
          adminNotes: notes || null,
          rejectionReason: rejectionReason || 'Transaction ID invalid or amount mismatch',
        })
        .where(eq(paymentSubmissions.id, submissionId));

      await db
        .update(orders)
        .set({
          paymentStatus: 'payment_rejected',
          fulfillmentStatus: 'cancelled',
        })
        .where(eq(orders.id, order.id));

      await db.insert(activityLogs).values({
        adminName,
        action: 'REJECT_PAYMENT',
        details: `Rejected payment for ${order.orderNumber} (Reason: ${rejectionReason})`,
      });
    }

    return { success: true };
  } catch (err) {
    console.error('Error verifying payment:', err);
    throw new Error('Failed to update payment status', { cause: err });
  }
}

export async function deliverOrder(
  orderId: number,
  deliveryInfo: string,
  adminName: string
) {
  try {
    const updated = await db
      .update(orders)
      .set({
        fulfillmentStatus: 'delivered',
        deliveryInfo,
        deliveredAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    await db.insert(activityLogs).values({
      adminName,
      action: 'DELIVER_ORDER',
      details: `Delivered digital items for order #${orderId}`,
    });

    return updated[0];
  } catch (err) {
    console.error('Error delivering order:', err);
    throw new Error('Failed to fulfill digital product delivery', { cause: err });
  }
}

// --- Coupons ---
export async function validateCoupon(code: string, subtotal: number) {
  try {
    const list = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code.trim().toUpperCase()), eq(coupons.isActive, true)));

    if (list.length === 0) {
      return { isValid: false, error: 'Invalid or expired coupon code' };
    }

    const c = list[0];
    const minSpend = parseFloat(c.minSpend || '0');
    if (subtotal < minSpend) {
      return {
        isValid: false,
        error: `Minimum spend of ৳${minSpend} required to use coupon '${c.code}'`,
      };
    }

    return {
      isValid: true,
      coupon: {
        code: c.code,
        discountType: c.discountType as 'percentage' | 'fixed',
        discountValue: parseFloat(c.discountValue),
        minSpend,
      },
    };
  } catch (err) {
    console.error('Error validating coupon:', err);
    throw new Error('Failed to validate coupon', { cause: err });
  }
}

// --- Settings ---
export async function getSettings() {
  try {
    const list = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (const item of list) {
      map[item.key] = item.value;
    }
    return map;
  } catch (err) {
    console.error('Error loading settings:', err);
    throw new Error('Failed to load settings', { cause: err });
  }
}

export async function updateSettings(newSettings: Record<string, string>, adminName: string) {
  try {
    for (const [key, value] of Object.entries(newSettings)) {
      await db
        .insert(settings)
        .values({ key, value: String(value) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: String(value), updatedAt: new Date() },
        });
    }

    await db.insert(activityLogs).values({
      adminName,
      action: 'UPDATE_SETTINGS',
      details: `Updated ${Object.keys(newSettings).length} settings`,
    });

    return { success: true };
  } catch (err) {
    console.error('Error updating settings:', err);
    throw new Error('Failed to save settings', { cause: err });
  }
}

// --- Analytics & Stats ---
export async function getAdminStats() {
  try {
    const allOrders = await db.select().from(orders);
    const allSubs = await db.select().from(paymentSubmissions);
    const allProds = await db.select().from(products);
    const allUsers = await db.select().from(users);
    const recentLogs = await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(10);

    const totalRevenue = allOrders
      .filter((o) => o.paymentStatus === 'payment_verified')
      .reduce((acc, o) => acc + parseFloat(o.totalAmount), 0);

    const pendingPayments = allSubs.filter(
      (s) => s.status === 'under_verification'
    ).length;

    const processingOrders = allOrders.filter(
      (o) => o.fulfillmentStatus === 'processing' || o.fulfillmentStatus === 'confirmed'
    ).length;

    const deliveredOrders = allOrders.filter(
      (o) => o.fulfillmentStatus === 'delivered'
    ).length;

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: allOrders.length,
      totalProducts: allProds.length,
      totalCustomers: allUsers.length,
      pendingPayments,
      processingOrders,
      deliveredOrders,
      recentLogs,
    };
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    throw new Error('Failed to load admin statistics', { cause: err });
  }
}
