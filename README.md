# ResumeX

ResumeX is a working prototype for reviewing a resume against a transparent, explainable rubric. It extracts text from common document formats, highlights likely ATS and readability issues, compares a resume with a job description, suggests conservative wording changes, and exports an improved draft.

[Try the live demo](https://resumex-livid.vercel.app)

The current analysis is deterministic and runs without an external AI service. ResumeX is best viewed as a full-stack product prototype, not a production hiring platform or a substitute for recruiter feedback.

## Why I built it

Most resume tools return a score without explaining where it came from. ResumeX explores a more useful workflow: show the scoring rules, separate safe edits from claims that need confirmation, and let the user review changes before export.

## What works today

- Upload a PDF, DOCX, or TXT file, or paste resume text directly.
- Extract server-side text with `pdf-parse` and Mammoth.
- Identify basic resume sections, contact details, skills, project bullets, and experience bullets.
- Score the resume with a documented 100-point internal rubric.
- Compare a resume with a job description using a small, explicit skill taxonomy.
- Flag unsupported job-description skills instead of adding them as facts.
- Review deterministic bullet rewrites before applying them.
- Preview the improved plain-text resume.
- Export TXT, JSON, DOCX, or a selectable-text PDF.
- Run the core analysis without an account, database, or API key.

The score is an internal estimate. It is not produced by an external ATS and does not predict interviews or hiring decisions.

## Scoring model

ResumeX calculates a maximum of 100 points:

| Category | Points |
| --- | ---: |
| Job-description skill match | 25 |
| Experience and project bullet quality | 20 |
| Text parseability | 15 |
| Section structure | 15 |
| Writing signals | 10 |
| Formatting signals | 10 |
| Contact details | 5 |

The implementation is in `src/features/analysis/scoring.ts`. The rules are deliberately simple and inspectable: they look at section coverage, a fixed skill taxonomy, action verbs, metrics, weak phrases, contact fields, and plain-text formatting signals.

## Quick start

Requirements:

- Node.js 20.18 or newer
- npm 10 or newer

```bash
git clone https://github.com/aksse01/ResumeX.git
cd ResumeX
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The guest workflow does not require environment variables.

Convenience scripts are also available:

```powershell
.\scripts\setup_windows.ps1
.\scripts\run_windows.ps1
```

```bash
chmod +x scripts/*.sh
./scripts/setup_unix.sh
./scripts/run_unix.sh
```

## Configuration

`.env.example` is a sanitized template containing local/example defaults and blank credential fields. Copy it only when you want to change configuration or explore the unfinished integration scaffolding:

```powershell
Copy-Item .env.example .env.local
```

```bash
cp .env.example .env.local
```

Only `RESUME_FILE_MAX_MB` is read by the current application path; it defaults to `8`. The other variables are reserved for planned integrations:

| Variables | Current status |
| --- | --- |
| `RESUME_FILE_MAX_MB` | Active upload-size setting |
| `DATABASE_URL` | Prisma schema scaffold; the app does not persist data |
| `NEXT_PUBLIC_APP_URL` | Reserved for deployment-aware URLs |
| `AI_PROVIDER`, `AI_MODEL`, `AI_TIMEOUT_MS` | Reserved for a future provider integration |
| `DEMO_MODE_ENABLED`, `AUTH_MODE` | Reserved for future runtime modes |
| `REDIS_URL`, `OBJECT_STORAGE_*` | Reserved for future queues and private file storage |

Local `.env*` files are ignored by Git. Keep real credentials in your deployment platform or an untracked local environment file, never in `.env.example`.

## Architecture

The working request path is intentionally small:

1. `src/app/api/resumes/analyze/route.ts` validates the request and extracts uploaded text.
2. `src/features/resumes/parser.ts` converts plain text into a lightweight resume model.
3. `src/features/analysis/scoring.ts` calculates category scores, issues, keyword matches, and rewrite suggestions.
4. `src/components/resume/resume-workspace.tsx` presents the review workflow and keeps the current result in a Zustand store.
5. `src/app/api/resumes/export/route.ts` generates TXT, JSON, DOCX, and PDF responses.

`prisma/schema.prisma`, the provider interface in `src/lib/ai/provider.ts`, and several dashboard/auth screens are design scaffolding. They are not connected to the current runtime workflow.

## Validation

Run the same checks used while developing the prototype:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

The current suite contains six Vitest tests for skill normalization, parsing, scoring, confirmation flags, export readiness, and safe suggestion application.

## Current limitations

- Parsing is heuristic and plain-text based. It can misclassify complex resumes and does not perform OCR on scanned PDFs.
- Job matching uses a limited built-in skill taxonomy rather than broad semantic matching or NLP.
- Rewrites are deterministic rules, not outputs from an external AI model.
- The selected resume goal is not yet used by the scoring engine.
- Confirmation-required suggestions are flagged, but the full confirmation-and-apply flow is not implemented.
- Export-readiness checks are advisory and are not enforced by the export endpoint.
- Auth forms, dashboard metrics, and the application tracker use demo content.
- The Prisma schema is not wired to application persistence, and no hosted database is required.
- The public demo does not include production controls such as authentication, rate limiting, malware scanning, durable storage, or account deletion. Do not upload a sensitive real resume.
- Tests currently cover core business logic, not the API routes or browser workflow.

The files under `docs/` include architecture and deployment notes for possible future work; they should not be read as a list of completed production integrations.

## License

MIT License. See [LICENSE](LICENSE).
