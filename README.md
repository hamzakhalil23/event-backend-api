# IjtemaApp — Backend API

Node.js, Express and TypeScript REST API behind the IjtemaApp system, built for Al Khair Foundation's annual Ijtema event. Uses Prisma ORM over PostgreSQL and deploys to AWS ECS Fargate behind a CI/CD pipeline in GitHub Actions. One of three components in the system (mobile app, backend API, admin web), built as part of a small team.

## What this does

Serves the schedule, sessions, speakers, tents, announcements, wishlists and auth for both the mobile app and the admin web panel.

## My contributions

- Added the `/speaker` endpoint (full CRUD), closing a gap where the `Speaker` model existed in the Prisma schema but had no API surface.
- Added the `/upload` endpoint for session and speaker images: multer with in memory storage, image only validation, a 10MB limit, UUID filenames and upload straight to S3, restricted to admin/organiser roles.
- Fixed a critical production bug where deleting a session returned a 500 error, caused by a missing cascade on the `MyList` (wishlist) foreign key; added the cascading delete logic to the session controller.

## Tech stack

Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, AWS S3, Docker, deployed to AWS ECS Fargate via GitHub Actions (OIDC, no long lived AWS keys in CI).

## Running locally

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Needs a `.env` with `DATABASE_URL` and the usual AWS S3 variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION`); see `src/lib/config.ts` for the full list. None of the project's actual deployment configuration (task definitions, IAM policies, DNS records) is included here, since that belongs to Al Khair Foundation's live infrastructure rather than to this code sample. `.github/workflows/deploy.yml` is included to show the CI/CD shape, but its AWS account and networking values are injected as GitHub Actions variables at deploy time rather than hardcoded, so it won't run as is outside that org's repo.

## Part of a team project

Built alongside a React Native mobile app and a Next.js admin panel, with Daniyal Sohail as technical lead reviewing all merges to `main` and owning production deployment. This repo is a personal copy of my contribution; the original, actively maintained repo lives under the Al Khair Foundation organisation.
