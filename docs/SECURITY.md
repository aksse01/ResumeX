# Security

ResumeX treats resumes and job descriptions as sensitive untrusted content.

## Current Prototype Safeguards

- Extension/MIME checks for PDF, DOCX, and TXT.
- A per-file size limit through `RESUME_FILE_MAX_MB`, applied after the multipart request is parsed.
- Server-side input validation with Zod.
- A sanitized environment-variable template with blank credential fields.
- No runtime database writes or external AI calls in the guest workflow.
- Advisory export-readiness checks for placeholders and unconfirmed claims.

These controls are suitable for a portfolio demo, not for processing sensitive resumes in production.

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
