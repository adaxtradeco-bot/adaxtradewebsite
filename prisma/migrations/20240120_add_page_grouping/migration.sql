-- CreateTable
CREATE TABLE "PageGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageGroup_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Page" ADD COLUMN "pageGroupId" TEXT,
ADD COLUMN "isDefaultLang" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "PageGroup_slug_key" ON "PageGroup"("slug");

-- CreateIndex
CREATE INDEX "Page_pageGroupId_idx" ON "Page"("pageGroupId");

-- CreateIndex
CREATE INDEX "Page_language_idx" ON "Page"("language");

-- CreateIndex
CREATE INDEX "Page_status_idx" ON "Page"("status");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_pageGroupId_fkey" FOREIGN KEY ("pageGroupId") REFERENCES "PageGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
