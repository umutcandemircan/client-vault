import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from "./env";

export type AdminSupabaseClient = SupabaseClient<Database>;

/**
 * Service-role client that bypasses RLS. Use only in trusted server code
 * (Server Actions, Route Handlers) for freelancer/admin operations, and
 * never return its raw results to a client without filtering.
 */
export function createAdminClient(): AdminSupabaseClient {
  const { url } = getSupabasePublicEnv();

  return createClient<Database>(url, getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
