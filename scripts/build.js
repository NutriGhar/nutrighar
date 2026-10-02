const { execSync } = require('child_process');

// Auto-detect Vercel Postgres / Storage environment variables
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.STORAGE_URL_PRISMA_DATABASE_URL ||
  process.env.STORAGE_URL_DATABASE_URL ||
  process.env.STORAGE_URL_POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
  console.log('✅ [Build] Successfully detected database connection from Vercel Storage.');
} else {
  console.warn('⚠️ [Build] Warning: No database URL detected in environment.');
}

try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  execSync('next build', { stdio: 'inherit', env: process.env });
} catch (error) {
  console.error('❌ [Build] Failed during build execution:', error);
  process.exit(1);
}
