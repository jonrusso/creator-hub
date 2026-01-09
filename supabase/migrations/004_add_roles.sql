-- ============================================
-- Creator Hub Database Migration
-- Migration 004: Simplify Roles (admin, editor, designer only)
-- ============================================

-- Drop the existing role check constraint
ALTER TABLE public.user_profiles 
DROP CONSTRAINT user_profiles_role_check;

-- Add new constraint with simplified roles (no creator)
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('admin', 'editor', 'designer'));

-- Update existing 'creator' roles to 'editor' (default for content workers)
UPDATE public.user_profiles 
SET role = 'editor' 
WHERE role = 'creator';

-- Also update the handle_new_user function - default to 'editor' now
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data->>'role', 'creator'),  -- Convert 'creator' to NULL
            'editor'  -- Default to editor
        ),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
