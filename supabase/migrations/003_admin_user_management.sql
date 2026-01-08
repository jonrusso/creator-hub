-- ============================================
-- Creator Hub RLS Policies Update
-- Migration 003: Admin User Management Policies
-- ============================================

-- ============================================
-- USER PROFILES POLICIES (Additional)
-- ============================================

-- Allow inserting new profiles (for invited users creating their profile)
-- This happens automatically when a new user is created via magic link
CREATE POLICY "Users can create their own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admins can insert profiles (for manual user creation if needed)
CREATE POLICY "Admins can create any profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (public.is_admin());

-- ============================================
-- STORAGE POLICIES (for inspiration-assets bucket)
-- ============================================

-- Note: These policies should be applied in Supabase Dashboard
-- Storage > Policies > inspiration-assets

-- INSERT: Authenticated users can upload
-- SELECT: Public access (anyone can view)
-- UPDATE: Owner or admin can update
-- DELETE: Owner or admin can delete

-- ============================================
-- CORS CONFIGURATION (Dashboard Only)
-- ============================================

-- For Chrome Extension uploads, configure CORS in:
-- Supabase Dashboard > Storage > Settings > CORS
-- 
-- Add origins:
-- - chrome-extension://* (for extension uploads)
-- - http://localhost:5173 (for local dev)
-- - https://your-production-domain.com (when deployed)
