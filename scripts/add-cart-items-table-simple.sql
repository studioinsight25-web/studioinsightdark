-- Simple SQL to create cartItems table
-- Copy and paste ONLY this part into Neon SQL Editor (without EXPLAIN)

CREATE TABLE IF NOT EXISTS "cartItems" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON "cartItems"("userId");
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON "cartItems"("productId");

