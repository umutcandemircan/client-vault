import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import { getSupabasePublicEnv } from "./env";

export type BrowserSupabaseClient = SupabaseClient<Database>;

/**
 * Supabase client for Client Components. `createBrowserClient` memoises the
 * instance internally, so calling this in multiple components is cheap.
 */
export function createClient(): BrowserSupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
