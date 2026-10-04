import "server-only";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { getSupabasePublicEnv, PORTAL_TOKEN_HEADER } from "./env";

export type ServerSupabaseClient = SupabaseClient<Database>;

/**
 * Cookie-aware client for Server Components, Server Actions and Route
 * Handlers. Carries the signed-in user's session (if any).
 */
export async function createClient(): Promise<ServerSupabaseClient> {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies; session refresh is
          // expected to happen in proxy.ts or a Server Action instead.
        }
      },
    },
  });
}

/**
 * Stateless client scoped to a single client portal. The access token is sent
 * as a request header and matched by the RLS policies, so queries only ever
 * return rows belonging to that portal.
 */
export function createPortalClient(accessToken: string): ServerSupabaseClient {
  const { url, anonKey } = getSupabasePublicEnv();

  return createSupabaseClient<Database>(url, anonKey, {
    global: { headers: { [PORTAL_TOKEN_HEADER]: accessToken } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
