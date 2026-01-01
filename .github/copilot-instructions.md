# Copilot instructions (spec-agent-ui)

## Project snapshot

- Next.js App Router UI in `src/app/` (React 19, Next `reactCompiler: true` in `next.config.ts`).
- UI talks directly to an external backend over HTTP; there are **no Next.js API routes** in this repo.
- Auth is via Auth0 (`@auth0/auth0-react`), and backend calls are authenticated with a Bearer token.

## Run / lint

- Dev server: `npm run dev`
- Production build: `npm run build` (then `npm run start`)
- Lint: `npm run lint` (ESLint v9 flat config in `eslint.config.mjs`)

## Environment (required)

- Required (module-load time):
  - `NEXT_PUBLIC_API_BASE_URL` (imports from `src/lib/api.ts` throw if missing)
- Required for Auth0 login + API tokens (used in `src/app/providers.tsx` + `src/hooks/use-api.ts`):
  - `NEXT_PUBLIC_AUTH0_DOMAIN`
  - `NEXT_PUBLIC_AUTH0_CLIENT_ID`
  - `NEXT_PUBLIC_AUTH0_AUDIENCE`
- `.env*` is gitignored; don’t rely on committed env files.

## Architecture & data flow

- Providers: `src/app/layout.tsx` wraps the app in `src/app/providers.tsx` (`<Auth0Provider ... />`).
- API client: components call `useApi()` (`src/hooks/use-api.ts`) which creates an authenticated client via `createApi(getToken)` in `src/lib/api.ts`.
- Routes / views:
  - `/` → `src/app/page.tsx` → `src/components/MainView.tsx` (list + create projects)
  - `/projects/[projectId]` → `src/app/projects/[projectId]/page.tsx` → `src/components/ProjectView.tsx` (list + upload project specs)
  - `/baselines` → `src/app/baselines/page.tsx` → `src/components/BaselineSpecsView.tsx` (list + upload baseline specs)
  - `/auth-test` → `src/app/auth-test/page.tsx` (manual Auth0/token debugging; handles “consent_required”)

## API contract (as used by the UI)

- All requests are authenticated: `Authorization: Bearer <access token>` (see `makeAuthedFetch()` in `src/lib/api.ts`).
- Projects:
  - `GET {API_BASE}/projects` → `Project[]`
  - `POST {API_BASE}/projects` JSON `{ name, code? }` → `Project`
- Specs:
  - `GET {API_BASE}/specs?projectId=...` → `SpecFile[]`
  - `GET {API_BASE}/specs?baseline=true` → `SpecFile[]`
  - `POST {API_BASE}/specs/upload` multipart form:
    - project spec: `file`, `projectId`
    - baseline spec: `file`
- List fetches use `cache: "no-store"` (keep unless intentionally adding caching).

## Code conventions to follow

- Client-side data loading is done in **client components** (`"use client"`) with `useEffect` + a `cancelled` flag, plus local `status: "idle" | "loading" | "error"` and `error: string | null`.
  - Examples: `src/components/MainView.tsx`, `src/components/ProjectView.tsx`.
- Prefer adding new backend calls to `createApi()` in `src/lib/api.ts` and consuming them via `useApi()` (typed exports like `Project`, `SpecFile`).
- Error handling pattern: API helpers use `parseJsonOrThrow()` which reads the response body text on non-2xx to aid debugging.
- Path aliases: use `@/…` for `src/*` and `@components/…` for `src/components/*` (see `tsconfig.json`).
- Styling is mostly Tailwind utility classes (Tailwind v4 via `src/app/globals.css`) and the small UI primitives in `src/components/ui/*`.
