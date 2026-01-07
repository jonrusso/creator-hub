-- ============================================
-- Creator Hub Row Level Security Policies
-- Migration 002: RLS Policies for Admin vs. Creator
-- ============================================

-- ============================================
-- HELPER FUNCTION: Check if user is Admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

-- Everyone can read all profiles (for displaying names in UI)
CREATE POLICY "Users can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Only admins can change roles
CREATE POLICY "Admins can update any profile"
    ON public.user_profiles FOR UPDATE
    USING (public.is_admin());

-- ============================================
-- WORKFLOWS POLICIES
-- ============================================

-- Everyone can read published workflows
CREATE POLICY "Anyone can view published workflows"
    ON public.workflows FOR SELECT
    USING (status = 'published');

-- Creators can view their own drafts
CREATE POLICY "Users can view own draft workflows"
    ON public.workflows FOR SELECT
    USING (author_id = auth.uid());

-- Admins can view all workflows (including pending)
CREATE POLICY "Admins can view all workflows"
    ON public.workflows FOR SELECT
    USING (public.is_admin());

-- Anyone authenticated can create workflows
CREATE POLICY "Authenticated users can create workflows"
    ON public.workflows FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own draft workflows
CREATE POLICY "Users can update own draft workflows"
    ON public.workflows FOR UPDATE
    USING (author_id = auth.uid() AND status = 'draft');

-- Users can submit their drafts for approval
CREATE POLICY "Users can submit own workflows for approval"
    ON public.workflows FOR UPDATE
    USING (author_id = auth.uid() AND status = 'draft')
    WITH CHECK (status IN ('draft', 'pending_approval'));

-- Admins can update any workflow (approve, edit, etc.)
CREATE POLICY "Admins can update all workflows"
    ON public.workflows FOR UPDATE
    USING (public.is_admin());

-- Users can delete their own draft workflows
CREATE POLICY "Users can delete own draft workflows"
    ON public.workflows FOR DELETE
    USING (author_id = auth.uid() AND status = 'draft');

-- Admins can delete any workflow
CREATE POLICY "Admins can delete any workflow"
    ON public.workflows FOR DELETE
    USING (public.is_admin());

-- ============================================
-- WORKFLOW SECTIONS POLICIES
-- ============================================

-- Sections inherit from parent workflow visibility
CREATE POLICY "Users can view sections of accessible workflows"
    ON public.workflow_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.workflows w
            WHERE w.id = workflow_id
            AND (w.status = 'published' OR w.author_id = auth.uid() OR public.is_admin())
        )
    );

-- Users can modify sections of their own draft workflows
CREATE POLICY "Users can modify sections of own draft workflows"
    ON public.workflow_sections FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.workflows w
            WHERE w.id = workflow_id
            AND w.author_id = auth.uid()
            AND w.status = 'draft'
        )
    );

-- Admins can modify all sections
CREATE POLICY "Admins can modify all sections"
    ON public.workflow_sections FOR ALL
    USING (public.is_admin());

-- ============================================
-- PRODUCTION CARDS POLICIES
-- ============================================

-- Everyone can view all production cards
CREATE POLICY "Anyone can view production cards"
    ON public.production_cards FOR SELECT
    USING (true);

-- Authenticated users can create cards
CREATE POLICY "Authenticated users can create cards"
    ON public.production_cards FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update cards assigned to them
CREATE POLICY "Users can update assigned cards"
    ON public.production_cards FOR UPDATE
    USING (assignee_id = auth.uid());

-- Admins can update any card
CREATE POLICY "Admins can update any card"
    ON public.production_cards FOR UPDATE
    USING (public.is_admin());

-- Only admins can delete cards
CREATE POLICY "Admins can delete cards"
    ON public.production_cards FOR DELETE
    USING (public.is_admin());

-- ============================================
-- CHECKLIST ITEMS POLICIES
-- ============================================

-- View checklist items for visible cards
CREATE POLICY "Anyone can view checklist items"
    ON public.checklist_items FOR SELECT
    USING (true);

-- Users can modify checklists on their assigned cards
CREATE POLICY "Users can modify checklists on assigned cards"
    ON public.checklist_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.production_cards c
            WHERE c.id = card_id
            AND (c.assignee_id = auth.uid() OR public.is_admin())
        )
    );

-- ============================================
-- INSPIRATION ACCOUNTS POLICIES
-- ============================================

-- Everyone can view accounts
CREATE POLICY "Anyone can view inspiration accounts"
    ON public.inspiration_accounts FOR SELECT
    USING (true);

-- Admins can manage accounts
CREATE POLICY "Admins can manage inspiration accounts"
    ON public.inspiration_accounts FOR ALL
    USING (public.is_admin());

-- ============================================
-- INSPIRATION ITEMS POLICIES
-- ============================================

-- Everyone can view all inspiration items
CREATE POLICY "Anyone can view inspiration items"
    ON public.inspiration_items FOR SELECT
    USING (true);

-- Authenticated users can create inspiration items
CREATE POLICY "Authenticated users can create inspiration items"
    ON public.inspiration_items FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own items (toggle saved, etc.)
CREATE POLICY "Users can update own inspiration items"
    ON public.inspiration_items FOR UPDATE
    USING (created_by = auth.uid());

-- Admins can update any inspiration item
CREATE POLICY "Admins can update any inspiration item"
    ON public.inspiration_items FOR UPDATE
    USING (public.is_admin());

-- Users can delete their own items
CREATE POLICY "Users can delete own inspiration items"
    ON public.inspiration_items FOR DELETE
    USING (created_by = auth.uid());

-- Admins can delete any inspiration item
CREATE POLICY "Admins can delete any inspiration item"
    ON public.inspiration_items FOR DELETE
    USING (public.is_admin());
