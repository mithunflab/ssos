-- Migration: Add new fields to clients table
-- Run this in your Supabase SQL editor to update existing database

-- Add new columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS budget DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'important';

-- Add constraint for status field
ALTER TABLE clients 
DROP CONSTRAINT IF EXISTS clients_status_check;

ALTER TABLE clients 
ADD CONSTRAINT clients_status_check 
CHECK (status IN ('general', 'important', 'working', 'finished'));

-- Update existing records to have 'important' status if null
UPDATE clients 
SET status = 'important' 
WHERE status IS NULL;
