# Deployment

## Environment Variables

The current guest demo runs without environment variables. `RESUME_FILE_MAX_MB` is the only setting read by the runtime and defaults to 8 MB. `.env.example` also lists reserved variables for future database, AI, auth, queue, and storage work; setting those variables does not enable those integrations.

## Local Commands

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run build
```

## Database Schema

```bash
npx prisma generate
npx prisma migrate dev
```

These commands generate and migrate the proposed schema. The current application does not create a Prisma client at runtime or persist user data.

## Production Notes

Deploy on a Node.js 20+ host. PDF exports are generated server-side with pdfkit, so keep the export route on a Node.js runtime. Before accepting sensitive real resumes, add authentication, rate limiting, malware scanning, request-size enforcement, monitoring, and an explicit data-retention policy.
