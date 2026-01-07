// API Client - toggleable between mock and Supabase
import { isSupabaseConfigured } from '../supabase/client';

// Import mock services
import * as mockServices from '../mock';

// Import Supabase services
import * as supabaseServices from '../supabase';

// Determine mode from environment or Supabase configuration
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false' || !isSupabaseConfigured();

// API client wrapper
const createClient = () => {
    if (USE_MOCK) {
        console.log('🔧 Using MOCK data services');
        return {
            workflowsService: mockServices.workflowsService,
            boardsService: mockServices.boardsService,
            authService: mockServices.authService,
            // Mock versions don't have these
            sectionsService: null,
            productionService: null,
            checklistService: null,
            inspirationService: null
        };
    }

    console.log('🌐 Using SUPABASE services');
    return {
        // Workflows
        workflowsService: supabaseServices.workflowsService,
        sectionsService: supabaseServices.sectionsService,

        // Boards
        productionService: supabaseServices.productionService,
        checklistService: supabaseServices.checklistService,
        inspirationService: supabaseServices.inspirationService,

        // Legacy compatibility (mapped to new services)
        boardsService: {
            getProduction: supabaseServices.productionService.getAll,
            getInspiration: supabaseServices.inspirationService.getAll,
            createProduction: supabaseServices.productionService.create,
            updateProduction: supabaseServices.productionService.update,
            deleteProduction: supabaseServices.productionService.delete,
            saveInspiration: supabaseServices.inspirationService.toggleSaved
        },

        // Auth is handled by AuthContext, but provide reference
        authService: null
    };
};

export const api = createClient();
export { USE_MOCK };

// Direct exports for tree-shaking
export const {
    workflowsService,
    boardsService,
    sectionsService,
    productionService,
    checklistService,
    inspirationService
} = api;
