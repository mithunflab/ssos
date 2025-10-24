-- Migration: Remove old fields from clients table
-- Run this in your Supabase SQL editor to remove unused columns

-- Remove old columns from clients table
ALTER TABLE clients 
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS company,
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS notes;
