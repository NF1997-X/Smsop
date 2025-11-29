# Vercel Deployment Guide

## Prerequisites

1. Install Vercel CLI (already done):
   ```bash
   npm install -g vercel
   ```

2. Make sure you have:
   - Vercel account
   - Database URL ready (PostgreSQL from Neon, Supabase, or Vercel Postgres)

## Environment Variables

Add these to Vercel project settings:

```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secret_key_here
NODE_ENV=production
```

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```

### 2. Link Project (first time only)
```bash
vercel link
```

### 3. Add Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Or use CLI:
```bash
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
```

### 4. Push Database Schema
```bash
npm run db:push
```

### 5. Deploy to Production
```bash
vercel --prod
```

## Quick Deploy
```bash
vercel
```

## Configuration Files

- `vercel.json` - Vercel deployment configuration
- `.vercelignore` - Files to exclude from deployment
- `package.json` - Added `vercel-build` script

## Important Notes

1. **Database**: Make sure DATABASE_URL points to production database
2. **Session Secret**: Generate secure SESSION_SECRET for production
3. **API Routes**: All `/api/*` routes handled by Express server
4. **Static Files**: Client build served from `dist/public`
5. **Environment**: Set NODE_ENV=production in Vercel

## Troubleshooting

- Check build logs in Vercel dashboard
- Verify environment variables are set
- Make sure database migrations ran successfully
- Check function logs for runtime errors

## Custom Domain

Add custom domain in Vercel Dashboard → Domains
