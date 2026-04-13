# Vercel Deployment

This project is set up to deploy from the repository root as:

- a static Vite frontend from `frontend/dist`
- a serverless Express API from `api/index.js`

## Before you deploy

Add these environment variables in Vercel Project Settings:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLOUDINARY_URL`
- `GMAIL_USER` (optional, only if you want email notifications)
- `GMAIL_PASS` (optional, only if you want email notifications)
- `FIREBASE_PROJECT_ID` (optional, only if you want push notifications)
- `FIREBASE_CLIENT_EMAIL` (optional, only if you want push notifications)
- `FIREBASE_PRIVATE_KEY` (optional, only if you want push notifications)
- `CLIENT_URL` (optional unless you use a custom production domain that is not `*.vercel.app` or `*.defactoinstitute.in`)

Do not set `VITE_API_BASE_URL` on Vercel unless your API is hosted on a different origin. The frontend now calls `/api/...` on the same deployment by default.

## Deploy

1. Import the repository into Vercel, using the repository root as the project root.
2. Use a lowercase project name such as `new-teacher`. Vercel will reject `NEW_Teacher` because project names must be lowercase.
3. Keep the detected build settings from `vercel.json`.
4. Add the environment variables above.
5. Deploy.

## Local verification

- Frontend dev server: `npm --prefix frontend run dev`
- Backend dev server: `npm --prefix backend run dev`
- Production build check: `npm run build`

The Vite dev server now proxies `/api` requests to `http://localhost:5000`, so local development matches the Vercel URL structure.
