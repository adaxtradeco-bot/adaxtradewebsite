-- CreateTable: Footer model for multilingual footer management
-- This migration is SAFE and does NOT modify existing data

CREATE TABLE "Footer" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Footer_language_key" ON "Footer"("language");

-- CreateIndex
CREATE INDEX "Footer_language_idx" ON "Footer"("language");

-- CreateIndex
CREATE INDEX "Footer_isActive_idx" ON "Footer"("isActive");

-- Note: This migration only ADDS a new table
-- It does NOT modify or delete any existing data
-- Existing SiteSettings table remains unchanged
