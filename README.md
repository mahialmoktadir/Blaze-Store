# BLAZE STORE ⚡
### Premium Bangladesh Digital Subscription & Software Products Marketplace
**Creator & Chief Architect:** MaHi Al-Moktadir  
**Helpline & WhatsApp:** [01842728840](https://wa.me/8801842728840)  
**Facebook:** [facebook.com/mahialmoktadir](https://www.facebook.com/mahialmoktadir)  
**Instagram:** [instagram.com/mahialmoktadir](https://www.instagram.com/mahialmoktadir/)  
**GitHub:** [github.com/mahialmoktadir](https://github.com/mahialmoktadir)  

---

## 1. Project Overview

**BLAZE STORE** is a production-ready, high-performance Bangladesh-based digital subscriptions, premium services, software licenses, and gift cards e-commerce platform. It enables local customers across Bangladesh to purchase international digital subscriptions using native mobile banking (bKash, Nagad, Rocket) in Bangladeshi Taka (৳ BDT) with zero foreign exchange fees.

### Key Capabilities
- **Premium Minimalist UI**: Sleek dark aesthetic (`#0B0D10` background, `#12151B` cards, `#FF6A00` Blaze accent) with Inter & Manrope typography.
- **Relational SQL Database**: Powered by Google Cloud SQL (PostgreSQL Developer Edition) with Drizzle ORM.
- **Manual Mobile Banking Payment Verification**: Complete TrxID verification engine for **bKash**, **Nagad**, and **Rocket** with duplicate prevention and anti-fraud status workflows.
- **Digital Product Delivery Vault**: Automated key assignment from `product_keys` table or manual credential dispatch with 1-click customer copying.
- **Order Tracking**: Real-time order progress timeline from submission to verified delivery via Order Number (e.g., `BLZ-2026-1001`).
- **Full Admin Control Hub**:
  - Live revenue analytics & transaction charts
  - Payment verification queue with 1-click Approve / Reject actions
  - Order management and digital license fulfillment
  - Dynamic Website & Payment Customization (edit bKash/Nagad numbers, brand logo, hero text, and social links in real time without modifying source code)
  - Customer support ticketing system
  - Coupon management (`BLAZE10`, `MAHI50`, `WELCOME`)
  - Complete activity audit logs

---

## 2. Technology Stack

- **Framework**: Next.js 15+ (App Router, Server Actions & API Routes)
- **Language**: TypeScript
- **Database**: Cloud SQL for PostgreSQL
- **ORM & Migrations**: Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Authentication**: Firebase Client & Admin SDK (Google Sign-In with OAuth token validation)
- **Styling**: Tailwind CSS v4 with custom dark mode theme tokens
- **Icons**: Lucide Icons
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`) via `npx --yes tsx --test`

---

## 3. Database Schema

The database schema (`src/db/schema.ts`) includes 14 relational tables:

1. **`users`**: Firebase Auth UID sync, email, name, role (`admin` | `customer`), phone, whatsapp.
2. **`categories`**: Entertainment, Music, Gaming, Productivity, Security & VPN, Software Licenses, Gift Cards.
3. **`products`**: Slug, description, thumbnail, regular price, discount price, subscription duration, stock, delivery method.
4. **`product_variations`**: Multi-duration options (1 Month, 3 Months, 6 Months, 1 Year, Lifetime) with distinct pricing.
5. **`product_keys`**: Digital license keys and account credentials inventory for automatic or manual dispatch.
6. **`orders`**: Unique order number (`BLZ-YYYY-XXXX`), customer details, subtotal, discount, total in BDT ৳, payment status, fulfillment status.
7. **`order_items`**: Line items with product ID, variation, quantity, and unit price.
8. **`payment_submissions`**: TrxID, sender mobile number, payment method, amount, status (`under_verification`, `payment_verified`, `payment_rejected`).
9. **`coupons`**: Discount codes (`BLAZE10`, `MAHI50`, `WELCOME`), percentage/fixed discount, minimum spend, expiry.
10. **`support_tickets`**: Customer inquiries with ticket numbers (`TKT-XXXX`), priority, and status.
11. **`support_messages`**: Real-time conversation thread between customer and admin.
12. **`reviews`**: Verified customer ratings and feedback.
13. **`settings`**: Dynamic key-value store for website name, payment numbers, hero copy, and social links.
14. **`activity_logs`**: Admin audit logs tracking verifications, deliveries, and settings updates.

---

## 4. Bangladesh Mobile Banking Workflow

1. **Product Selection & Cart**: Customer selects plan (e.g. Netflix UHD 1 Month @ ৳260).
2. **Checkout Details**: Customer provides Name, Email, and WhatsApp number.
3. **MFS Payment Display**: Customer selects bKash, Nagad, or Rocket:
   - Configured Number displayed: `01842728840` (Personal - Send Money)
   - 1-Click Copy button
   - Exact amount to pay: `৳260.00`
4. **Transaction ID Submission**:
   - Customer submits their 8-12 character alphanumeric Transaction ID (`TrxID`) and Sender Phone Number.
   - Duplicate TrxID detection prevents replaying old transactions.
5. **Admin Verification & Delivery**:
   - Status changes to `under_verification`.
   - Admin verifies payment in Admin Panel and clicks **Approve & Release Product**.
   - If license keys are in stock in `product_keys`, the system auto-assigns the key.
   - Customer instantly sees digital access in their dashboard and tracking view, and receives WhatsApp delivery.

---

## 5. Installation & Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL or Google Cloud SQL Auth Proxy

### Steps
```bash
# 1. Clone repository
git clone https://github.com/mahialmoktadir/blaze-store.git
cd blaze-store

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
# SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB_NAME, SQL_ADMIN_USER, SQL_ADMIN_PASSWORD

# 4. Push database schema
npx drizzle-kit push --config=src/db/drizzle.config.ts

# 5. Run automated unit tests
npx --yes tsx --test lib/ecommerce-logic.test.ts

# 6. Start development server
npm run dev
```

---

## 6. Production Deployment

1. Set environment variables in Cloud Run or your hosting provider:
   - `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`, `SQL_ADMIN_USER`, `SQL_ADMIN_PASSWORD`
   - `GEMINI_API_KEY` (if AI features are enabled)
   - `APP_URL`
2. Build the Next.js production bundle:
   ```bash
   npm run build
   ```
3. Start the production server:
   ```bash
   npm start
   ```

---
**BLAZE STORE** — Crafted by **MaHi Al-Moktadir**.
