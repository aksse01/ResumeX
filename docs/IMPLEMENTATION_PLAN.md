# KindlyCV AI Implementation Plan

## Current Repository

The original repository is a Python Streamlit resume analyzer with a useful local scoring engine and basic setup scripts. The requested product is a full KindlyCV AI SaaS application using Next.js, TypeScript, structured services, authenticated dashboards, resume parsing, scoring, optimization, review, export, and documentation.

## Migration Strategy

1. Keep the previous Python implementation as legacy reference while making the primary product a Next.js App Router application.
2. Implement a functional guest-mode workflow first: upload or paste resume, add job description, parse, score, identify issues, generate safe factual rewrites, review before/after changes, recalculate score, and export.
3. Add production architecture scaffolding for authentication, Prisma, AI abstraction, security, background jobs, and storage without committing secrets.
4. Document incomplete enterprise integrations honestly so the app remains runnable on any developer machine.

## Implemented In This Pass

- Next.js TypeScript foundation.
- KindlyCV AI brand, landing page, dashboard, auth demo screens, upload wizard, analysis dashboard, editor/review workspace, application tracker, and assistant panels.
- Local deterministic analyzer with transparent 100-point scoring rubric.
- Job-description matching and keyword matrix.
- Safe rewrite suggestions with claim-status controls.
- TXT, JSON, DOCX, and improved PDF export endpoints.
- Prisma schema and service boundaries.
- Documentation and tests for the core workflow.

## Deferred Production Integrations

- Real hosted authentication provider.
- Live PostgreSQL persistence and migrations on a deployed database.
- Redis-backed background processing.
- External AI provider calls.
- Malware scanning and object storage.
- Payment/subscription provider.

These are represented through interfaces, environment variables, Prisma models, and documentation so they can be added without replacing the core product logic.
