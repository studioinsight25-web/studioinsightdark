-- Add digitalProducts and userDownloads tables if they don't exist
-- Run this in your Neon database console if you get "relation does not exist" errors

-- Create digitalProducts table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "digitalProducts" (
  id VARCHAR(255) PRIMARY KEY,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  "fileName" VARCHAR(255) NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileSize" INTEGER,
  "mimeType" VARCHAR(255),
  "downloadLimit" INTEGER DEFAULT 5,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create userDownloads table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "userDownloads" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "digitalProductId" VARCHAR(255) REFERENCES "digitalProducts"(id) ON DELETE CASCADE,
  "downloadCount" INTEGER DEFAULT 0,
  "lastDownloadedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_digital_products_product_id ON "digitalProducts"("productId");
CREATE INDEX IF NOT EXISTS idx_user_downloads_user_id ON "userDownloads"("userId");
CREATE INDEX IF NOT EXISTS idx_user_downloads_digital_product_id ON "userDownloads"("digitalProductId");

