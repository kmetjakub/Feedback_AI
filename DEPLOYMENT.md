# Deploying FeedbackAI to Vercel

## Prerequisites
- A GitHub account
- A Vercel account (free tier works)
- Your Anthropic API key (from https://console.anthropic.com)

---

## Step 1: Push to GitHub

1. Create a new repository on GitHub (github.com/new)
   - Name it `feedback-ai` (or anything you like)
   - Leave it **empty** (no README, no .gitignore)

2. In your terminal from the project folder:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/feedback-ai.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select the `feedback-ai` repo you just pushed
4. Vercel will auto-detect it as a Next.js project — keep defaults

---

## Step 3: Add Environment Variables

Before clicking Deploy, add these environment variables in the Vercel UI:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_3OM0HIoLWDRt@ep-billowing-water-apg03612-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `ANTHROPIC_API_KEY` | Your key from console.anthropic.com |

> **Note:** The `DATABASE_URL` already points to the Neon database that has been migrated and seeded. The `ANTHROPIC_API_KEY` enables AI insights — if omitted, the app shows a friendly message instead of crashing.

---

## Step 4: Deploy

1. Click **Deploy**
2. Vercel runs `npm run build` (which includes `prisma generate && next build`)
3. In about 1–2 minutes your app will be live at `https://feedback-ai-xxx.vercel.app`

---

## Step 5: Verify the deployment

1. Visit `https://your-app.vercel.app` — you should see the landing page
2. Go to `/feedback` — submit a test response
3. Go to `/dashboard` — the response appears; click "Generate Insights" to test Claude

---

## Troubleshooting

**Build fails with "Cannot find module @prisma/client"**
- Ensure `"postinstall": "prisma generate"` is in `package.json` scripts (already set)

**Database connection error on Vercel**
- Double-check `DATABASE_URL` is set in Vercel → Settings → Environment Variables
- Make sure there are no extra spaces around the value

**AI Insights shows "not configured"**
- Add `ANTHROPIC_API_KEY` in Vercel environment variables and redeploy

**Need to re-run migrations after schema changes**
- Locally: `npx prisma migrate dev --name <description>`
- This updates Neon directly since `DATABASE_URL` points to the cloud DB

---

## Sharing the feedback form

Once deployed, share `https://your-app.vercel.app/feedback` with anyone — no login required. All responses are stored in Neon and visible in your dashboard at `/dashboard`.
