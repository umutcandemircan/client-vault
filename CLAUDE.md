# ClientVault: Architecture & Engineering Standards

## Project Overview
A secure client onboarding & asset collection portal for freelancers/agencies.
Stack: Next.js (App Router), TypeScript (Strict), Tailwind CSS, Shadcn UI, Supabase.

## Golden Rules for AI Generation
1. STRICT TYPESCRIPT: No ny type allowed under any circumstances. Define strict interfaces.
2. MODULARITY: No single file or component should exceed 150 lines. Extract UI, hooks, and actions into separate files.
3. UX STATES: Every data-fetching UI must explicitly handle 3 states:
   - Loading (using Skeleton loader)
   - Error (actionable message + retry button)
   - Empty state (friendly guidance when no items exist)
4. NO VIBE-CODING ARTIFACTS: Avoid dark purple neon gradients, generic corporate slogans, and redundant comments (e.g. "// set state to true").
5. SECURITY & DATA INTEGRITY:
   - Never upload files directly through Next.js server actions. Use Presigned URLs (Cloudflare R2 / S3).
   - Supabase RLS (Row Level Security) must be enabled on every table.
