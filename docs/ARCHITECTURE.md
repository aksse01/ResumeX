# Architecture

ResumeX is now structured as a Next.js App Router application with TypeScript.

## Layers

- `src/app`: routes, API endpoints, and page composition.
- `src/components`: reusable UI and the resume review workspace.
- `src/features`: deterministic parsing, scoring, job-skill matching, and export-readiness logic.
- `src/lib`: file extraction, an unused future AI-provider interface, and shared utilities.
- `src/types`: normalized resume and analysis models.
- `prisma`: proposed data model; it is not imported by the runtime application.

## Core Workflow

1. User uploads or pastes resume content.
2. `/api/resumes/analyze` validates input and extracts text from PDF, DOCX, or TXT.
3. Parser builds a normalized `ResumeDocument`.
4. Scoring engine applies the transparent 100-point internal rubric.
5. The scoring rules generate conservative wording suggestions and flag missing skills for confirmation.
6. The UI shows before/after review, issues, a keyword matrix, and advisory export-readiness checks.
7. `/api/resumes/export` returns TXT, JSON, DOCX, or a polished improved resume PDF built from the accepted-change preview.

## Production Integrations

The Prisma schema and AI-provider interface are design scaffolding only. Authentication, database persistence, object storage, Redis queues, structured logging, external AI calls, and audit-log writes are not connected to the runtime application.
