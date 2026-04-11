#!/usr/bin/env node

/**
 * Direct SQL Execution on Production Database
 * Run this locally with production DATABASE_URL
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.production' });

const sql = `
CREATE TABLE IF NOT EXISTS "public"."Footer" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "companyName" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "contactInfo" TEXT,
    "columns" TEXT NOT NULL,
    "bottomBar" TEXT,
    "style" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Footer_language_key" ON "public"."Footer"("language");
CREATE INDEX IF NOT EXISTS "Footer_language_idx" ON "public"."Footer"("language");
CREATE INDEX IF NOT EXISTS "Footer_isActive_idx" ON "public"."Footer"("isActive");
`;

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    
    console.log('🗄️  Creating Footer table...');
    await client.query(sql);
    
    console.log('✅ Footer table created successfully!');
    console.log('🎉 Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
