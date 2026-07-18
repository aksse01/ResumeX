# ResumeX Implementation Plan

## Current Repository

The repository began as a Python Streamlit analyzer and was rebuilt as a Next.js and TypeScript prototype. The working scope is resume extraction, deterministic scoring, job-skill matching, suggestion review, and export. Authenticated dashboards and hosted integrations remain future work.

## Prototype Strategy

1. Keep the previous Python implementation as legacy reference while making the primary product a Next.js App Router application.
2. Implement a functional guest-mode workflow first: upload or paste resume, add job description, parse, score, identify issues, generate safe factual rewrites, review before/after changes, recalculate score, and export.
3. Keep future database and provider ideas separate from the working guest flow.
4. Document incomplete integrations so the app remains runnable on any developer machine.

## Current Prototype

- Next.js TypeScript foundation.
- ResumeX landing page, upload workflow, analysis results, review workspace, and static dashboard/auth/application-tracker previews.
- Local deterministic analyzer with transparent 100-point scoring rubric.
- Job-description matching and keyword matrix.
- Safe rewrite suggestions with claim-status controls.
- TXT, JSON, DOCX, and improved PDF export endpoints.
- Prisma schema and provider-interface scaffolding; neither is connected to runtime persistence or external AI.
- Documentation and tests for the core workflow.

## Deferred Production Integrations

- Real hosted authentication provider.
- Live PostgreSQL persistence and migrations on a deployed database.
- Redis-backed background processing.
- External AI provider calls.
- Malware scanning and object storage.
- Payment/subscription provider.

Some of these ideas are represented by environment-variable placeholders, a provider interface, Prisma models, or planning notes. They are not implemented integrations.
