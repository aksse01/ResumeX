# Setup

## Quick Start

Prerequisites:

- Node.js 20.18 or newer
- npm 10 or newer
- Git

```bash
git clone https://github.com/aksse01/ResumeX.git
cd ResumeX
npm ci
npm run dev
```

The guest workflow uses built-in defaults and does not require an environment file or database.

## Optional Configuration

Copy `.env.example` to `.env.local` only to change `RESUME_FILE_MAX_MB` or inspect variables reserved for future integrations. The example contains local/example values and blank credential fields.

The Prisma schema can be generated with `npx prisma generate`, but the current application does not use a runtime database client. Creating or migrating a database does not enable persistence.

## Testing

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```
