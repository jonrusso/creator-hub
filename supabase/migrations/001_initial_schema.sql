-- ============================================
-- Creator Hub Database Schema
-- Migration 001: Initial Schema with Fractional Indexing
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES (extends auth.users)
-- ============================================
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'creator')) DEFAULT 'creator',
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'creator'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- WORKFLOWS (Documentation System)
-- ============================================
CREATE TABLE public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending_approval', 'published')) DEFAULT 'draft',
    author_id UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workflow_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'image', 'video', 'prompt')),
    content TEXT,
    url TEXT,
    platform TEXT,
    caption TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_sections_workflow ON public.workflow_sections(workflow_id);
CREATE INDEX idx_workflow_sections_position ON public.workflow_sections(workflow_id, position);

-- ============================================
-- PRODUCTION BOARD (Kanban with Fractional Indexing)
-- ============================================
CREATE TABLE public.production_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    stage TEXT NOT NULL CHECK (stage IN ('scripting', 'production', 'editing', 'qa', 'published')) DEFAULT 'scripting',
    assignee_id UUID REFERENCES public.user_profiles(id),
    due_date DATE,
    format TEXT,
    position TEXT NOT NULL DEFAULT '0|aaaaaa:',  -- LexoRank format
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.checklist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES public.production_cards(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    checked BOOLEAN DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_production_cards_stage ON public.production_cards(stage);
CREATE INDEX idx_production_cards_position ON public.production_cards(stage, position);
CREATE INDEX idx_checklist_items_card ON public.checklist_items(card_id);

-- ============================================
-- INSPIRATION BOARD (with Asset Persistence)
-- ============================================
CREATE TABLE public.inspiration_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'pinterest', 'behance', 'other')),
    handle TEXT,
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.inspiration_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    title TEXT,
    
    -- Permanent assets (owned by us in Supabase Storage)
    asset_path TEXT NOT NULL,
    asset_url TEXT NOT NULL,
    thumbnail_path TEXT,
    thumbnail_url TEXT,
    
    -- Original source (for reference, may expire)
    original_url TEXT,
    source_platform TEXT CHECK (source_platform IN ('instagram', 'pinterest', 'behance', 'other')),
    source_creator TEXT,
    source_account_id UUID REFERENCES public.inspiration_accounts(id),
    
    saved BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspiration_items_saved ON public.inspiration_items(saved);
CREATE INDEX idx_inspiration_items_platform ON public.inspiration_items(source_platform);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON public.workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_production_cards_updated_at
    BEFORE UPDATE ON public.production_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspiration_items ENABLE ROW LEVEL SECURITY;
