import { supabase, isSupabaseConfigured } from './client';

/**
 * Workflows Service - CRUD operations for documentation workflows
 */
export const workflowsService = {
    /**
     * Get all workflows (respects RLS - users see published + own drafts, admins see all)
     */
    getAll: async () => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('workflows')
            .select(`
                *,
                author:user_profiles(id, email, full_name, role)
            `)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get single workflow with all sections
     */
    getById: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('workflows')
            .select(`
                *,
                author:user_profiles(id, email, full_name, role),
                sections:workflow_sections(*)
            `)
            .eq('id', id)
            .order('position', { foreignTable: 'workflow_sections', ascending: true })
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Create new workflow
     */
    create: async (workflow) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('workflows')
            .insert({
                title: workflow.title,
                description: workflow.description || '',
                status: 'draft',
                author_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update workflow (title, description, status)
     */
    update: async (id, updates) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('workflows')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete workflow (cascades to sections)
     */
    delete: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('workflows')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    },

    /**
     * Submit workflow for approval
     */
    submitForApproval: async (id) => {
        return workflowsService.update(id, { status: 'pending_approval' });
    },

    /**
     * Approve workflow (admin only)
     */
    approve: async (id) => {
        return workflowsService.update(id, { status: 'published' });
    },

    /**
     * Reject workflow back to draft (admin only)
     */
    reject: async (id) => {
        return workflowsService.update(id, { status: 'draft' });
    }
};

/**
 * Workflow Sections Service
 */
export const sectionsService = {
    /**
     * Add section to workflow
     */
    create: async (workflowId, section) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Get max position
        const { data: existing } = await supabase
            .from('workflow_sections')
            .select('position')
            .eq('workflow_id', workflowId)
            .order('position', { ascending: false })
            .limit(1);

        const nextPosition = existing?.length > 0 ? existing[0].position + 1 : 0;

        const { data, error } = await supabase
            .from('workflow_sections')
            .insert({
                workflow_id: workflowId,
                title: section.title,
                type: section.type,
                content: section.content || '',
                url: section.url || null,
                platform: section.platform || null,
                caption: section.caption || null,
                position: nextPosition
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update section
     */
    update: async (id, updates) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('workflow_sections')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete section
     */
    delete: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('workflow_sections')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    },

    /**
     * Reorder sections
     */
    reorder: async (workflowId, sectionIds) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Update positions in order
        const updates = sectionIds.map((id, index) =>
            supabase
                .from('workflow_sections')
                .update({ position: index })
                .eq('id', id)
        );

        await Promise.all(updates);
        return { success: true };
    }
};

export default workflowsService;
