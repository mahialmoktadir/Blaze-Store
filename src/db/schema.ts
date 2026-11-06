import { boolean, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (linked to Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  role: text('role').default('customer').notNull(), // 'admin' | 'customer'
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  thumbnail: text('thumbnail').notNull(),
  gallery: text('gallery'), // JSON array string
  categoryId: integer('category_id').references(() => categories.id),
  regularPrice: numeric('regular_price', { precision: 10, scale: 2 }).notNull(),
  discountPrice: numeric('discount_price', { precision: 10, scale: 2 }),
  productCost: numeric('product_cost', { precision: 10, scale: 2 }),
  subscriptionDuration: text('subscription_duration').default('1 Month'),
  productType: text('product_type').default('subscription'), // 'subscription' | 'license_key' | 'gift_card' | 'digital_download' | 'manual_delivery'
  stockQuantity: integer('stock_quantity').default(999),
  deliveryMethod: text('delivery_method').default('manual_delivery'), // 'auto_key' | 'email' | 'whatsapp' | 'manual_delivery'
  deliveryInstructions: text('delivery_instructions'),
  isFeatured: boolean('is_featured').default(false),
  isTrending: boolean('is_trending').default(false),
  status: text('status').default('active'), // 'active' | 'draft' | 'out_of_stock'
  createdAt: timestamp('created_at').defaultNow(),
});

// Product Variations
export const productVariations = pgTable('product_variations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  name: text('name').notNull(), // e.g. "1 Month - 1 Screen (UHD)"
  duration: text('duration').notNull(), // "1 Month", "3 Months", "6 Months", "1 Year"
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  regularPrice: numeric('regular_price', { precision: 10, scale: 2 }),
  stock: integer('stock').default(100),
  isDefault: boolean('is_default').default(false),
});

// Product Keys (for automatic and manual license/credential assignments)
export const productKeys = pgTable('product_keys', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  variationId: integer('variation_id').references(() => productVariations.id),
  licenseKey: text('license_key'),
  accountCredentials: text('account_credentials'),
  isUsed: boolean('is_used').default(false),
  orderId: integer('order_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(), // e.g. "BLZ-2026-1001"
  userId: text('user_id'), // Firebase UID or 'guest'
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone'),
  customerWhatsapp: text('customer_whatsapp').notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric('discount_amount', { precision: 10, scale: 2 }).default('0.00'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull(), // 'bkash' | 'nagad' | 'rocket' | 'cod'
  paymentStatus: text('payment_status').default('awaiting_payment'), // 'awaiting_payment' | 'payment_submitted' | 'under_verification' | 'payment_verified' | 'payment_rejected' | 'refunded'
  fulfillmentStatus: text('fulfillment_status').default('pending'), // 'pending' | 'processing' | 'confirmed' | 'delivered' | 'cancelled' | 'refunded'
  orderNotes: text('order_notes'),
  deliveryInfo: text('delivery_info'), // License key, account login, instructions sent to customer
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Order Items
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  variationId: integer('variation_id'),
  productName: text('product_name').notNull(),
  variationName: text('variation_name'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').default(1).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
});

// Payment Submissions (TrxID verification records)
export const paymentSubmissions = pgTable('payment_submissions', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  orderNumber: text('order_number').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'bkash' | 'nagad' | 'rocket'
  senderPhone: text('sender_phone').notNull(),
  transactionId: text('transaction_id').notNull().unique(), // Unique to prevent replay
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  screenshotUrl: text('screenshot_url'),
  status: text('status').default('under_verification'), // 'under_verification' | 'payment_verified' | 'payment_rejected'
  adminNotes: text('admin_notes'),
  rejectionReason: text('rejection_reason'),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coupons
export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').default('percentage'), // 'percentage' | 'fixed'
  discountValue: numeric('discount_value', { precision: 10, scale: 2 }).notNull(),
  minSpend: numeric('min_spend', { precision: 10, scale: 2 }).default('0.00'),
  usageLimit: integer('usage_limit').default(100),
  timesUsed: integer('times_used').default(0),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
});

// Support Tickets
export const supportTickets = pgTable('support_tickets', {
  id: serial('id').primaryKey(),
  ticketNumber: text('ticket_number').notNull().unique(),
  userId: text('user_id'),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerWhatsapp: text('customer_whatsapp'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  priority: text('priority').default('medium'), // 'low' | 'medium' | 'high' | 'urgent'
  status: text('status').default('open'), // 'open' | 'in_progress' | 'resolved' | 'closed'
  createdAt: timestamp('created_at').defaultNow(),
});

// Support Messages
export const supportMessages = pgTable('support_messages', {
  id: serial('id').primaryKey(),
  ticketId: integer('ticket_id').references(() => supportTickets.id).notNull(),
  senderType: text('sender_type').notNull(), // 'customer' | 'admin'
  senderName: text('sender_name').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reviews
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  customerName: text('customer_name').notNull(),
  rating: integer('rating').default(5).notNull(),
  comment: text('comment').notNull(),
  isApproved: boolean('is_approved').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Settings (Key-Value store for Brand, Payments, Socials, SEO)
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Activity & Audit Logs
export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  adminName: text('admin_name').notNull(),
  action: text('action').notNull(),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variations: many(productVariations),
  keys: many(productKeys),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  submissions: many(paymentSubmissions),
}));

export const supportTicketsRelations = relations(supportTickets, ({ many }) => ({
  messages: many(supportMessages),
}));
