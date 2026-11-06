import { db } from './index.ts';
import {
  categories,
  products,
  productVariations,
  coupons,
  settings,
  reviews,
  users,
} from './schema.ts';

export async function seedDatabase() {
  console.log('Seeding Blaze Store database...');

  // Settings
  const initialSettings = [
    { key: 'site_name', value: 'BLAZE STORE' },
    { key: 'creator_name', value: 'MaHi Al-Moktadir' },
    { key: 'contact_number', value: '01842728840' },
    { key: 'whatsapp_url', value: 'https://wa.me/8801842728840' },
    { key: 'facebook_url', value: 'https://www.facebook.com/mahialmoktadir' },
    { key: 'instagram_url', value: 'https://www.instagram.com/mahialmoktadir/' },
    { key: 'github_url', value: 'https://github.com/mahialmoktadir' },
    { key: 'bkash_number', value: '01842728840' },
    { key: 'bkash_type', value: 'Personal' },
    { key: 'bkash_enabled', value: 'true' },
    { key: 'nagad_number', value: '01842728840' },
    { key: 'nagad_type', value: 'Personal' },
    { key: 'nagad_enabled', value: 'true' },
    { key: 'rocket_number', value: '01842728840' },
    { key: 'rocket_type', value: 'Personal' },
    { key: 'rocket_enabled', value: 'true' },
    { key: 'cod_enabled', value: 'false' },
    {
      key: 'hero_title',
      value: 'Premium Digital Subscriptions at Bangladesh Best Rates',
    },
    {
      key: 'hero_subtitle',
      value:
        'Instant delivery via WhatsApp & Email. 100% verified accounts, authentic licenses, and rapid replacement guarantee.',
    },
    {
      key: 'notice_text',
      value:
        '🔥 Limited Time Promo: Get 10% instant discount using code BLAZE10 at checkout!',
    },
  ];

  for (const item of initialSettings) {
    await db
      .insert(settings)
      .values(item)
      .onConflictDoUpdate({ target: settings.key, set: { value: item.value } });
  }

  // Admin user
  await db
    .insert(users)
    .values({
      uid: 'admin-mahi-blaze',
      email: 'mrmahirajkumar143@gmail.com',
      name: 'MaHi Al-Moktadir',
      phone: '01842728840',
      whatsapp: '01842728840',
      role: 'admin',
    })
    .onConflictDoNothing();

  // Coupons
  const initialCoupons = [
    {
      code: 'BLAZE10',
      discountType: 'percentage',
      discountValue: '10.00',
      minSpend: '200.00',
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'MAHI50',
      discountType: 'fixed',
      discountValue: '50.00',
      minSpend: '400.00',
      usageLimit: 300,
      isActive: true,
    },
    {
      code: 'WELCOME',
      discountType: 'percentage',
      discountValue: '15.00',
      minSpend: '150.00',
      usageLimit: 1000,
      isActive: true,
    },
  ];

  for (const c of initialCoupons) {
    await db
      .insert(coupons)
      .values(c)
      .onConflictDoNothing();
  }

  console.log('Seed completed successfully.');
}
