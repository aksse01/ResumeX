# Security

KindlyCV AI treats resumes and job descriptions as sensitive untrusted content.

## Implemented

- File type validation for PDF, DOCX, and TXT.
- File size limit through `RESUME_FILE_MAX_MB`.
- Server-side input validation with Zod.
- Environment variable template for secrets.
- No secrets committed to the repository.
- Prompt injection warning in architecture and prompts.
- Prisma ownership-ready schema with user relations.
- Export readiness checks for placeholders and unconfirmed claims.

## Required Before Production

- Configure real authentication.
- Enforce ownership checks in every protected route.
- Use private object storage and short-lived signed URLs.
- Add rate limiting.
- Add malware scanning integration.
- Add CSRF protections where applicable.
- Add audit log writes for sensitive actions.
- Encrypt persistent storage at rest.
- Configure account deletion and document deletion workflows.
