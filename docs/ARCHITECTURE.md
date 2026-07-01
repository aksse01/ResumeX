# Architecture

KindlyCV AI is now structured as a Next.js App Router application with TypeScript.

## Layers

- `src/app`: routes, API endpoints, and page composition.
- `src/components`: reusable UI, resume workspace, dashboard, and marketing components.
- `src/features`: business logic for parsing, analysis, optimization, exports, applications, and job matching.
- `src/lib`: provider abstractions for AI, files, validation, security, and utilities.
- `src/types`: normalized resume and analysis models.
- `prisma`: database schema for production persistence.

## Core Workflow

1. User uploads or pastes resume content.
2. `/api/resumes/analyze` validates input and extracts text from PDF, DOCX, or TXT.
3. Parser builds a normalized `ResumeDocument`.
4. Scoring engine applies the transparent 100-point internal rubric.
5. Optimizer generates safe factual suggestions and confirmation-required risky suggestions.
6. UI shows before/after review, issues, keyword matrix, and export readiness.
7. `/api/resumes/export` returns TXT, JSON, DOCX, or a polished improved resume PDF built from the accepted-change preview.

## Production Integrations

The codebase is prepared for Auth.js, Clerk, or Supabase Auth, PostgreSQL through Prisma, object storage, Redis queues, structured logging, AI provider adapters, and audit logs. Demo mode remains fully local and deterministic.
