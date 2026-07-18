# Troubleshooting

## Node is not recognized

Install Node.js 20.18 or newer from the official Node.js website, then restart your terminal.

## Dependencies fail to install

Delete `node_modules` and reinstall:

```bash
npm install
```

## Inspecting the Prisma schema

Run:

```bash
npx prisma generate
```

The current guest workflow does not import Prisma or persist data, so this step is optional.

## Port 3000 is already in use

Run on another port:

```bash
npm run dev -- -p 3001
```

## PDF upload fails

Some PDFs are scanned images or encrypted. Paste the resume text manually, or convert the file to a text-based PDF or DOCX.

## DOCX upload fails

Make sure the file is a valid `.docx`, not the older `.doc` format.

## Changing local configuration

The current guest workflow builds without an environment file. To change the upload-size setting, copy the sanitized example:

```bash
copy .env.example .env.local
```

On macOS/Linux:

```bash
cp .env.example .env.local
```
