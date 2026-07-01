# Setup

## Quick Start

Prerequisites:

- Node.js 20.18 or newer
- npm 10 or newer
- Git

```bash
git clone https://github.com/aksse01/ResumeX.git
cd ResumeX
npm install
copy .env.example .env.local
npx prisma generate
npm run dev
```

Use `cp` instead of `copy` on macOS/Linux.

## Optional Database

Demo mode works without a running database. To enable persistence:

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in `.env.local`.
3. Run `npx prisma migrate dev`.

## Testing

```bash
npm run test
npm run typecheck
npm run build
```
