-- Add fileData BYTEA column to digitalProducts table for storing files directly in database
-- This allows serving files directly from database, bypassing Cloudinary restrictions

ALTER TABLE "digitalProducts" 
ADD COLUMN IF NOT EXISTS "fileData" BYTEA;

-- Create index on fileData is not needed (BYTEA can't be indexed efficiently)
-- But we can add a check to ensure either filePath OR fileData is present
-- Note: This constraint is commented out as it requires checking existing data first
-- ALTER TABLE "digitalProducts" ADD CONSTRAINT check_file_source CHECK (
--   ("filePath" IS NOT NULL AND "filePath" != '') OR 
--   ("fileData" IS NOT NULL)
-- );

