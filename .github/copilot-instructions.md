# Copilot instructions (spec-agent-ui)

## Project snapshot

- Next.js App Router UI in `src/app/` (React 19, Next `reactCompiler: true` in `next.config.ts`).
- UI talks to an external backend over HTTP; there are **no Next.js API routes** in this repo.

## Run / lint

- Dev server: `npm run dev`
- Production build: `npm run build` (then `npm run start`)
- Lint: `npm run lint` (ESLint v9 flat config in `eslint.config.mjs`)

## Environment (required)

- `NEXT_PUBLIC_API_BASE_URL` must be set or imports from `src/lib/api.ts` will throw at module load.
- Local default is in `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001`.
- `.env*` is gitignored (see `.gitignore`), so don’t rely on committed env files.

## Architecture & data flow

- Route `/` renders `src/app/page.tsx` → `src/components/ProjectsView.tsx`.
  - Lists projects and creates projects via `listProjects()` / `createProject()` in `src/lib/api.ts`.
- Route `/projects/[projectId]` renders `src/app/projects/[projectId]/page.tsx` → `src/components/ProjectSpecsView.tsx`.
  - Lists spec files and uploads a spec via `listSpecs(projectId)` / `uploadSpec()`.

## API contract (as used by the UI)

- `GET {API_BASE}/projects` → `Project[]`
- `POST {API_BASE}/projects` body `{ name, code? }` → `Project`
- `GET {API_BASE}/specs?projectId=...` → `SpecFile[]`
- `POST {API_BASE}/specs/upload` multipart form fields: `file`, `projectId` → created `SpecFile`
- Fetches that list data use `cache: "no-store"` in `src/lib/api.ts` (keep this unless you intentionally add caching).

## Code conventions to follow

- Client-side data loading is done in **client components** (`"use client"`) with `useEffect` + a `cancelled` flag, plus local `status: "idle" | "loading" | "error"` and `error: string | null`.
  - Examples: `src/components/ProjectsView.tsx`, `src/components/ProjectSpecsView.tsx`.
- Prefer adding new backend calls to `src/lib/api.ts` and importing them into components (typed exports like `Project`, `SpecFile`).
- Path aliases: use `@/…` for `src/*` and `@components/…` for `src/components/*` (see `tsconfig.json`).
- Styling is mostly Tailwind utility classes (Tailwind v4 via `src/app/globals.css`), with simple inline styles used for page-level container layout.
