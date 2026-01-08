// Supabase Edge Function: invite-user
// Securely invites new team members with email + role assignment
// Runs on Deno runtime (not Node.js)

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface InviteRequest {
    email: string;
    role: string;
    fullName?: string;
}

interface AuthUser {
    id: string;
    email?: string;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get the authorization header (user's JWT)
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error("Missing authorization header");
        }

        // Get environment variables
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            throw new Error("Missing Supabase environment variables");
        }

        // Create Supabase client with user's token to verify they're an admin
        const userClient: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify the requesting user is authenticated and is an admin
        const {
            data: { user },
            error: userError,
        } = await userClient.auth.getUser();

        if (userError || !user) {
            throw new Error("Unauthorized: Invalid token");
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await userClient
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || profile?.role !== "admin") {
            throw new Error("Unauthorized: Only admins can invite users");
        }

        // Parse request body
        const { email, role, fullName }: InviteRequest = await req.json();

        if (!email) {
            throw new Error("Email is required");
        }

        const validRoles = ["admin", "creator", "editor", "designer"];
        if (!role || !validRoles.includes(role)) {
            throw new Error(`Valid role is required (${validRoles.join(", ")})`);
        }

        // Create admin client with service role key for user creation
        const adminClient: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // Check if user already exists
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
            (u: AuthUser) => u.email === email
        );

        if (existingUser) {
            throw new Error("A user with this email already exists");
        }

        // Invite the user (sends magic link email)
        const { data: inviteData, error: inviteError } =
            await adminClient.auth.admin.inviteUserByEmail(email, {
                data: {
                    full_name: fullName || "",
                    role: role,
                    invited_by: user.id,
                },
            });

        if (inviteError) {
            throw new Error(`Failed to invite user: ${inviteError.message}`);
        }

        // Return success
        return new Response(
            JSON.stringify({
                success: true,
                message: `Invitation sent to ${email}`,
                data: {
                    userId: inviteData.user?.id,
                    email: email,
                    role: role,
                },
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (err: unknown) {
        const error = err as Error;
        console.error("Invite user error:", error.message);

        const isUnauthorized = error.message?.includes("Unauthorized");

        return new Response(
            JSON.stringify({
                success: false,
                error: error.message || "Unknown error",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: isUnauthorized ? 401 : 400,
            }
        );
    }
});
