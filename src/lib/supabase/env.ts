/**
 * Public Supabase configuration, safe for both browser and server bundles.
 *
 * Each variable is referenced by its literal name because Next.js only inlines
 * `NEXT_PUBLIC_*` values into client bundles for static property access.
 */

export const PORTAL_TOKEN_HEADER = "x-portal-token";

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

function requireValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Add it to .env.local (see .env.example).`,
    );
  }
  return value;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    url: requireValue(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    anonKey: requireValue(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getSupabaseServiceRoleKey(): string {
  return requireValue(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
