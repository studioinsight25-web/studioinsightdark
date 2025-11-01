# Database Migration: Missing Tables

## Problemen
- "relation 'digitalProducts' does not exist" - Tabel voor digitale producten ontbreekt
- "relation 'cartItems' does not exist" - Tabel voor winkelwagen items ontbreekt

## Oplossingen

### 1. Digital Products Tabellen
Voer deze SQL query uit in je Neon Database Console:

```sql
-- Create digitalProducts table
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

-- Create userDownloads table
CREATE TABLE IF NOT EXISTS "userDownloads" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "digitalProductId" VARCHAR(255) REFERENCES "digitalProducts"(id) ON DELETE CASCADE,
  "downloadCount" INTEGER DEFAULT 0,
  "lastDownloadedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_digital_products_product_id ON "digitalProducts"("productId");
CREATE INDEX IF NOT EXISTS idx_user_downloads_user_id ON "userDownloads"("userId");
CREATE INDEX IF NOT EXISTS idx_user_downloads_digital_product_id ON "userDownloads"("digitalProductId");
```

### 2. Cart Items Tabel (voor winkelwagen functionaliteit)
Voer deze SQL query uit:

```sql
-- Create cartItems table
CREATE TABLE IF NOT EXISTS "cartItems" (
  id VARCHAR(255) PRIMARY KEY,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "productId" VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON "cartItems"("userId");
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON "cartItems"("productId");
```

### Volledige Database Reset
Als je een volledige reset wilt, gebruik dan `scripts/init-database.sql` (dit verwijdert alle bestaande data).

## Stappen

1. Ga naar je Neon Database Dashboard
2. Open de SQL Editor
3. Kopieer en plak de SQL query hierboven (of uit `scripts/add-digital-products-tables.sql`)
4. Klik op "Run" of "Execute"
5. Controleer of de tabellen zijn aangemaakt met:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('digitalProducts', 'userDownloads');
   ```

## Verificatie

Na het uitvoeren zou je deze tabellen moeten hebben:
- ✅ `digitalProducts` - voor digitale bestanden
- ✅ `userDownloads` - voor het bijhouden van downloads
- ✅ `cartItems` - voor winkelwagen functionaliteit

Nu zou zowel de upload functionaliteit als het toevoegen aan winkelwagen moeten werken!

