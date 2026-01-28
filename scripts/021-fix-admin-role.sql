-- ===================================================
-- Check and Fix Admin Role
-- ===================================================

-- First, check if profiles table has role column
-- If not, add it
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Check current user
SELECT id, email, role FROM profiles LIMIT 5;

-- Update all existing profiles to have role = 'user' (if null)
UPDATE profiles SET role = 'user' WHERE role IS NULL;

-- For testing, you can manually update your admin user to have role = 'admin'
-- Replace the email with your admin email
UPDATE profiles SET role = 'admin' WHERE email = '6abart@gmail.com';

-- Verify the update
SELECT id, email, role FROM profiles WHERE email = '6abart@gmail.com';
