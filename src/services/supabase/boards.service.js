import { supabase, isSupabaseConfigured } from './client';
import { generateLexoRank, generateBetweenRank } from '../../hooks/useLexoRank';

/**
 * Production Board Service - Kanban CRUD with Fractional Indexing
 */
export const productionService = {
    /**
     * Get all production cards grouped by stage
     */
    getAll: async () => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('production_cards')
            .select(`
                *,
                assignee:user_profiles(id, email, full_name),
                checklists:checklist_items(*)
            `)
            .order('position', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Get cards by stage
     */
    getByStage: async (stage) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('production_cards')
            .select(`
                *,
                assignee:user_profiles(id, email, full_name),
                checklists:checklist_items(*)
            `)
            .eq('stage', stage)
            .order('position', { ascending: true });

        if (error) throw error;
        return data;
    },

    /**
     * Create new card
     */
    create: async (card) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Get the last position in the target stage
        const { data: lastCard } = await supabase
            .from('production_cards')
            .select('position')
            .eq('stage', card.stage || 'scripting')
            .order('position', { ascending: false })
            .limit(1);

        // Generate new position after last card
        const newPosition = lastCard?.length > 0
            ? generateBetweenRank(lastCard[0].position, null)
            : generateLexoRank();

        const { data, error } = await supabase
            .from('production_cards')
            .insert({
                title: card.title,
                description: card.description || '',
                stage: card.stage || 'scripting',
                assignee_id: card.assignee_id || null,
                due_date: card.due_date || null,
                format: card.format || null,
                position: newPosition
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update card
     */
    update: async (id, updates) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('production_cards')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Move card to new position (fractional indexing)
     * Only updates 1 row regardless of list size
     */
    move: async (id, targetStage, beforeCardId = null, afterCardId = null) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        let newPosition;

        if (beforeCardId && afterCardId) {
            // Moving between two cards
            const { data: neighbors } = await supabase
                .from('production_cards')
                .select('id, position')
                .in('id', [beforeCardId, afterCardId]);

            const before = neighbors.find(c => c.id === beforeCardId);
            const after = neighbors.find(c => c.id === afterCardId);
            newPosition = generateBetweenRank(before?.position, after?.position);
        } else if (afterCardId) {
            // Moving to the start (before first card)
            const { data: after } = await supabase
                .from('production_cards')
                .select('position')
                .eq('id', afterCardId)
                .single();

            newPosition = generateBetweenRank(null, after?.position);
        } else if (beforeCardId) {
            // Moving to the end (after last card)
            const { data: before } = await supabase
                .from('production_cards')
                .select('position')
                .eq('id', beforeCardId)
                .single();

            newPosition = generateBetweenRank(before?.position, null);
        } else {
            // Empty column, use default
            newPosition = generateLexoRank();
        }

        const { data, error } = await supabase
            .from('production_cards')
            .update({
                stage: targetStage,
                position: newPosition
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete card
     */
    delete: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('production_cards')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    },

    /**
     * Subscribe to real-time changes
     */
    subscribe: (callback) => {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured, skipping subscription');
            return { unsubscribe: () => { } };
        }

        const subscription = supabase
            .channel('production_cards_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'production_cards' },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();

        return subscription;
    }
};

/**
 * Checklist Service
 */
export const checklistService = {
    create: async (cardId, label) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Get max position
        const { data: existing } = await supabase
            .from('checklist_items')
            .select('position')
            .eq('card_id', cardId)
            .order('position', { ascending: false })
            .limit(1);

        const nextPosition = existing?.length > 0 ? existing[0].position + 1 : 0;

        const { data, error } = await supabase
            .from('checklist_items')
            .insert({
                card_id: cardId,
                label,
                checked: false,
                position: nextPosition
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    toggle: async (id, checked) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('checklist_items')
            .update({ checked })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    delete: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('checklist_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }
};

/**
 * Inspiration Board Service
 */
export const inspirationService = {
    /**
     * Get all inspiration items
     */
    getAll: async () => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('inspiration_items')
            .select(`
                *,
                created_by_user:user_profiles(id, email, full_name),
                account:inspiration_accounts(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get saved items only
     */
    getSaved: async () => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data, error } = await supabase
            .from('inspiration_items')
            .select('*')
            .eq('saved', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Create new inspiration item (called from Chrome Extension)
     */
    create: async (item) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('inspiration_items')
            .insert({
                type: item.type,
                title: item.title || 'Untitled',
                asset_path: item.asset_path,
                asset_url: item.asset_url,
                thumbnail_path: item.thumbnail_path || null,
                thumbnail_url: item.thumbnail_url || null,
                original_url: item.original_url || null,
                source_platform: item.source_platform || 'other',
                source_creator: item.source_creator || null,
                saved: false,
                created_by: user?.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Toggle saved status
     */
    toggleSaved: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        // Get current state
        const { data: current } = await supabase
            .from('inspiration_items')
            .select('saved')
            .eq('id', id)
            .single();

        const { data, error } = await supabase
            .from('inspiration_items')
            .update({ saved: !current?.saved })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete inspiration item
     */
    delete: async (id) => {
        if (!isSupabaseConfigured()) {
            throw new Error('Supabase not configured');
        }

        const { error } = await supabase
            .from('inspiration_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    },

    /**
     * Subscribe to real-time changes
     */
    subscribe: (callback) => {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured, skipping subscription');
            return { unsubscribe: () => { } };
        }

        const subscription = supabase
            .channel('inspiration_items_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'inspiration_items' },
                (payload) => {
                    callback(payload);
                }
            )
            .subscribe();

        return subscription;
    }
};

export default {
    production: productionService,
    checklist: checklistService,
    inspiration: inspirationService
};
