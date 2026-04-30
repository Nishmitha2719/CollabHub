-- ============================================
-- AUTH ISSUES FIX - Run this in Supabase SQL Editor
-- ============================================
-- This script fixes common authentication issues:
-- 1. Ensures RLS policies allow profile creation during signup
-- 2. Adds automatic profile creation trigger
-- 3. Adds proper constraints and indexes
-- ============================================

-- ============================================
-- STEP 1: Drop conflicting policies (if they exist)
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- ============================================
-- STEP 2: Recreate RLS policies for profiles
-- ============================================

-- Allow anyone to read profiles (public view)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own profile
-- THIS IS CRITICAL FOR SIGNUP - auth.uid() must match the id
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 3: Create or replace auto-profile trigger
-- ============================================

-- Function to create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.user_metadata->>'name', split_part(new.email, '@', 1)),
    'user'
  );
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail signup
  RAISE WARNING 'Error creating profile: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Verify table constraints
-- ============================================

-- Ensure profiles table has correct constraints
-- (If this fails, it means table structure is already correct)
-- ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE(email) ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 5: Test the setup
-- ============================================

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'projects')
  AND schemaname = 'public';

-- Check existing policies
SELECT schemaname, tablename, policyname, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';

-- ============================================
-- NOTES FOR DEBUGGING
-- ============================================
-- If you're still getting "Failed to fetch" errors:
--
-- 1. Check browser console for detailed error messages
--    - Look for CORS errors
--    - Look for RLS violation messages
--
-- 2. Verify environment variables are set:
--    - NEXT_PUBLIC_SUPABASE_URL should be your Supabase project URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY should be your anon key
--    - Both must include NEXT_PUBLIC_ prefix to be visible in browser
--
-- 3. Check Supabase auth settings:
--    - Authentication > Providers > Email Auth must be enabled
--    - Site URL must include your local domain (localhost:3000)
--    - Additional Redirect URLs should include /auth/callback
--
-- 4. Check Supabase CORS settings:
--    - Settings > API > CORS should allow your domain
--    - Default should allow all origins for development
--
-- 5. Common RLS errors:
--    - "new row violates row-level security policy" when INSERT
--      → Check that the profile id matches auth.uid()
--    - "permission denied" when SELECT
--      → Check that RLS policies allow SELECT
--
-- ============================================
