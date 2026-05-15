/**
 * Seed script — creates the SuperAdmin if none exists.
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from environment variables.
 * Safe to run multiple times (idempotent).
 */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function seed() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name     = process.env.ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    console.log('[seed] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping seed.');
    return;
  }

  const existing = await db.superAdmin.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] SuperAdmin ${email} already exists — nothing to do.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.superAdmin.create({ data: { email, name, passwordHash } });
  console.log(`[seed] SuperAdmin created: ${email}`);
}

seed()
  .catch(err => { console.error('[seed] Error:', err); process.exit(1); })
  .finally(() => db.$disconnect());
