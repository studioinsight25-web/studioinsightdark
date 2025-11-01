-- Create newsletterSubscriptions table if it doesn't exist
-- Run this in your Neon database console on Vercel

CREATE TABLE IF NOT EXISTS "newsletterSubscriptions" (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  consent BOOLEAN DEFAULT true,
  status VARCHAR(50) DEFAULT 'pending',
  "confirmationToken" VARCHAR(255) UNIQUE,
  "confirmedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON "newsletterSubscriptions"(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON "newsletterSubscriptions"(status);

