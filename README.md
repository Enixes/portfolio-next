# Asu Singh — Portfolio

An interactive, backend-centric portfolio built with Next.js App Router, React, TypeScript, and performance-conscious CSS/SVG motion.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

For the alternate Sites-compatible development runtime, use `npm run dev:sites`.

## Production builds

```bash
npm run build:next
```

The standard Next.js build is used by Vercel. `npm run build` also produces the Sites-compatible build for the included hosting workflow.

## Deploy to Vercel

Import the repository into Vercel and deploy. The included `vercel.json` selects the standard Next.js build.

## Contact form delivery

The Contact board always lists email, LinkedIn, and GitHub. To enable its direct form, set these server environment variables in the deployment:

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key used by `/api/contact` |
| `CONTACT_FROM_EMAIL` | Sender address on a domain verified in Resend, for example `hello@yourdomain.com` |

The route sends a plain-text note to the email in `data/cv.ts` and sets the visitor’s address as reply-to. Without both variables, the form stays disabled and offers a direct email link. Provider failures also show an error while keeping the visitor’s typed note in place. No credentials belong in the repository.
