-- Add currency column to profiles table
ALTER TABLE profiles ADD COLUMN currency TEXT DEFAULT 'INR';

-- Update existing profiles to have INR as default
UPDATE profiles SET currency = 'INR' WHERE currency IS NULL;