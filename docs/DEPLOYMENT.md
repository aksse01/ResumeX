# Deployment

## Environment Variables

Copy `.env.example` to `.env.local` for local development. Production deployments should set:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `AI_PROVIDER`
- `AI_MODEL`
- `AI_TIMEOUT_MS`
- `RESUME_FILE_MAX_MB`
- `DEMO_MODE_ENABLED`
- Auth provider secrets
- Object storage credentials
- Redis URL when background jobs are enabled

## Local Commands

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run build
```

## Database

```bash
npx prisma generate
npx prisma migrate dev
```

## Production Notes

Deploy on a Node.js 20+ host. Configure PostgreSQL, private object storage, logging, error monitoring, and a queue before enabling long-running file processing or external AI calls. Improved PDF exports are generated server-side with pdfkit, so keep the resume export API on a Node.js runtime.
