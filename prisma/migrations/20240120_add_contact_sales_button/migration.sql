-- CreateTable: ContactSalesButton model for multilingual contact sales buttons
-- This migration is SAFE and does NOT modify existing data

CREATE TABLE "ContactSalesButton" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "show" BOOLEAN NOT NULL DEFAULT true,
    "text" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "style" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSalesButton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactSalesButton_language_key" ON "ContactSalesButton"("language");

-- CreateIndex
CREATE INDEX "ContactSalesButton_language_idx" ON "ContactSalesButton"("language");

-- CreateIndex
CREATE INDEX "ContactSalesButton_isActive_idx" ON "ContactSalesButton"("isActive");

-- Note: This migration only ADDS a new table
-- It does NOT modify or delete any existing data
-- Existing SiteSettings table remains unchanged
