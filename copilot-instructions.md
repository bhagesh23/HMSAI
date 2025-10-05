Project: Shree Medicare HMS (React + Vite frontend + Express server)

Summary / Big picture
- Frontend: TypeScript React app built with Vite; entry at `src/main.tsx` and `src/App.tsx`.
- Backend: Minimal Express server in `server/index.cjs` exposing REST endpoints under `/api/*` on port 8080. DB access via `server/db.cjs` (mysql).
- Data shapes: canonical interfaces live in `src/types/index.ts`; mock data in `src/store/mockData.ts`.

Developer workflows (essential commands)
- Run frontend dev server: `npm run dev` (Vite, default port 5173).
- Build frontend: `npm run build`.
- Run backend server: `npm run server` (starts `node server/index.cjs` on port 8080).
- Lint: `npm run lint` (ESLint).

Project-specific conventions & patterns
- API base URL is assumed to be `http://localhost:8080` in client code. Many components call endpoints like:
  - `GET /api/patients`, `GET /api/patients/:id`, `PUT /api/patients/:id`, `POST /api/patients/add`
  - `POST /api/auth/patient/login` and `POST /api/auth/patient/register`
  - Portal routes: `/api/portal/*` e.g. `/api/portal/my-appointments/:patientId`
- File uploads and public assets are served from the `public/` folder; server serves static files via express.static in `server/index.cjs`.
- The backend uses CommonJS (`.cjs`) while package.json is ESM; the server runs standalone with Node (`npm run server`).

Integration points & external deps
- MySQL: `server/db.cjs` uses `mysql` and a local DB named `hms` by default. Connection values are in `server/db.cjs` (change for your env) and `.env` is loaded from project root by `server/index.cjs`.
- Twilio is included as a dependency (used by `server/sms.cjs`).
- Multer is used for uploads; uploaded files are saved under `public/uploads` and served statically.

Useful patterns for editing code
- When adding or changing API routes, update `server/index.cjs` to mount your new `*.cjs` route module under `/api/<name>`.
- Frontend makes raw `fetch` calls to `http://localhost:8080/api/...`. For local testing, run backend with `npm run server` and frontend with `npm run dev` simultaneously.
- Use the TypeScript interfaces in `src/types/index.ts` as the source of truth when adding props/state for components.

Examples to copy/paste
- Fetch patient details (frontend):
  fetch(`http://localhost:8080/api/patients/${patientId}`)
- Start dev servers (PowerShell):
  npm run server; npm run dev

When editing tests or adding features, prefer small, local-proof changes: update `src/types`, add API route in `server/` and call it from a component under `src/components/`.

What to look out for
- Hard-coded base URL (`http://localhost:8080`) across many components — consider centralizing if you refactor networking.
- Mixed module systems: keep server files as CommonJS `.cjs` (they're required by `server/index.cjs`).
- DB credentials are in `server/db.cjs` — don't commit production secrets. Prefer `.env` and update `server/db.cjs` to read from process.env if you need to support deployed envs.

If you change public asset paths, update `server/index.cjs` static middleware and any `profileImageUrl` references in components (example: `PatientDashboard.tsx`).

If anything here is unclear or you want more detail (examples for triage, SMS, or pharmacy flows), tell me which module and I'll expand the instructions.
