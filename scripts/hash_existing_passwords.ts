import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function migratePasswords() {
  console.log('--- Checking Customer Passwords for Hashing ---');
  const customers = await prisma.customer.findMany({
    where: {
      passwordHash: {
        not: null,
      },
    },
  });

  console.log(`Found ${customers.length} customers with passwords.`);
  let updatedCount = 0;

  for (const c of customers) {
    if (c.passwordHash && !c.passwordHash.startsWith('$2a$') && !c.passwordHash.startsWith('$2b$') && !c.passwordHash.startsWith('$2y$')) {
      console.log(`Hashing plaintext password for customer ${c.email || c.phone || c.id}...`);
      const hashed = await bcrypt.hash(c.passwordHash.trim(), 10);
      await prisma.customer.update({
        where: { id: c.id },
        data: { passwordHash: hashed },
      });
      updatedCount++;
    }
  }

  console.log(`Migration complete! Successfully hashed ${updatedCount} unhashed customer passwords into secure bcrypt hashes.`);
  process.exit(0);
}

migratePasswords().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
