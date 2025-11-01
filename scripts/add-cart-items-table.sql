-- Add cartItems table if it doesn't exist
-- Run this in your Neon database console if you get "relation cartItems does not exist" errors

-- Create cartItems table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "cartItems" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance (if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cart_items_user_id') THEN
    CREATE INDEX idx_cart_items_user_id ON "cartItems"("userId");
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cart_items_product_id') THEN
    CREATE INDEX idx_cart_items_product_id ON "cartItems"("productId");
  END IF;
END $$;

