# iSkool — CLAUDE.md

## Project Overview

iSkool is a Skool.com-inspired multi-tenant online learning community platform for the Brazilian market. It supports communities, courses (modules/lessons), social feed, real-time chat, notifications, and Hotmart payment integration.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, Vite 7 |
| Routing | Wouter 3 |
| Server State | TanStack React Query v5 |
| UI | Radix UI + shadcn/ui (new-york style) + Tailwind CSS v4 |
| Rich Text | TipTap 3 |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express 4 (TypeScript via tsx) |
| Database/Auth/Storage | Supabase (PostgreSQL + Supabase Auth + Supabase Storage) |
| ORM (schema only) | Drizzle ORM |
| Payments | Hotmart webhooks |
| Deploy | Vercel (SPA) |

## Commands

```bash
npm run dev          # Express dev server (serves Vite via middleware)
npm run dev:client   # Vite standalone on port 3000
npm run build        # Full build (client + server)
npm run build:client # Vite build only → dist/public/
npm run start        # Production: node dist/index.cjs
npm run check        # TypeScript type check
npm run db:push      # Push Drizzle schema to database
```

## Project Structure

```
client/src/
  pages/           # Route-level components
  components/
    ui/            # 57 shadcn/ui primitives
    admin/         # Admin forms and CRUD components
    social/        # Post cards, comments, reactions
    chat/          # Chat UI
    post-composer/ # Rich post composition
  hooks/           # 26 custom React hooks (use-*.ts)
  services/        # Supabase data-access functions
  lib/             # Utilities (supabase client, queryClient, permissions)
  contexts/        # React contexts (community-context)
  types/           # TypeScript declarations

server/
  index.ts         # Entry point + middleware
  routes.ts        # Express API routes (minimal)
  hotmart-webhook.ts

shared/
  schema.ts        # Drizzle schema (type sharing)

supabase/
  migrations/      # Numbered SQL migration files (source of truth for DB schema)
```

## Architecture

### Data Flow

Component → custom hook (`hooks/use-*.ts`) → service function (`services/*.ts`) → Supabase JS client → PostgreSQL (with RLS)

Almost all data access goes directly from the frontend to Supabase. Express only handles: health check, post creation (server validation), course creation (admin), enrollment, and Hotmart webhooks.

### Data Fetching Pattern

```typescript
// 1. Service layer (services/*.ts)
export async function getAllPosts(): Promise<PostWithRelations[]> { ... }

// 2. Hook layer (hooks/use-*.ts)
export function useAllPosts() {
  return useQuery({ queryKey: ['all-posts'], queryFn: () => postsService.getAllPosts() });
}

// 3. Component uses the hook
const { data: posts, isLoading } = useAllPosts();
```

To add a new feature: create service → create hook → use in component.

### Multi-Tenancy

Community slug from URL (`/c/:slug/...`) → `CommunityContext` → all queries filter by `community_id`. Always use `useSelectedCommunity()` to get the current community.

### Authentication

Handled entirely by Supabase Auth on the frontend. `useAuth()` hook provides `{ user, session, loading, signOut }`. Role (`admin`/`student`) lives in the `users` Postgres table. Use `useIsAdmin()` for UI gating. RLS enforces data-level security.

### Security

All data access security is enforced by Supabase RLS policies, not Express middleware. The Hotmart webhook uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

## Conventions

### Naming
- Files: `kebab-case` (e.g., `use-admin-courses.ts`, `community-form.tsx`)
- Components: `PascalCase`
- Hooks: `use` prefix + camelCase (`useAllPosts`, `useIsAdmin`)
- Database columns: `snake_case`
- TypeScript interfaces: `PascalCase`

### Import Aliases
- `@/` → `client/src/`
- `@shared/` → `shared/`

### State Management
- Server state: TanStack React Query (all remote data)
- Auth state: `useAuth()` hook
- Community context: `useSelectedCommunity()`
- Local UI state: `useState`
- No Redux/Zustand

### Query Keys
Flat array keys: `['all-posts']`, `['user-role', userId]`, `['community', slug]`

### Permissions
`lib/permissions.ts` exports `can()` and `canComment()`. Admins have full access; students can only edit/delete their own content.

### Image Storage
Dual approach: Supabase Storage URLs (`logo_url`, `cover_url`) and Base64 inline (`logo_data`, `cover_data`). Helper functions `getCommunityLogoUrl()` and `getCourseCoverImageUrl()` handle priority (data > URL).

## Database

Schema lives in `supabase/migrations/` (numbered SQL files). Key tables: `users`, `communities`, `community_members`, `courses`, `modules`, `lessons`, `enrollments`, `lesson_progress`, `posts`, `comments`, `conversations`, `messages`, `notifications`, `announcements`, `hotmart_products`, `hotmart_purchases`.

New DB changes: add numbered SQL migration in `supabase/migrations/`.

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (frontend + backend) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (frontend + backend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin ops bypassing RLS (backend only) |
| `DATABASE_URL` | PostgreSQL connection (drizzle-kit) |
| `HOTMART_HOTTOK` | Hotmart webhook validation |

## MCP Servers

O projeto usa o **Supabase MCP** (configurado em `~/.claude/settings.json`). Para operações de banco de dados (executar SQL, queries, migrations, seed data), usar SEMPRE as ferramentas MCP do Supabase (prefixo `mcp__supabase__`) em vez de sugerir ações manuais no Dashboard.

## Language

The application UI and content are in Brazilian Portuguese (pt-BR). Code (variables, functions, comments) is in English.
