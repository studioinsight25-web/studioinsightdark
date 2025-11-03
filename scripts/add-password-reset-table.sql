-- Add password reset tokens table
-- This allows users to reset their password via email token

CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON "password_reset_tokens"(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON "password_reset_tokens"(user_id);

-- Create index for cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON "password_reset_tokens"(expires_at);

