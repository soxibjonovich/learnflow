# Shared Database Setup Guide

## Overview

LearnFlow now supports a **shared database** where all users can see and edit the same flashcards. This is perfect for:
- Study groups sharing vocabulary
- Classroom learning
- Collaborative language learning
- Community-driven card collections

**No login or registration required!** Everyone can view, add, edit, and delete cards.

---

## Setup Instructions

### Step 1: Create Supabase Project (Free)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (free tier is generous!)
4. Click "New Project"
5. Fill in:
   - **Name**: learnflow-db (or anything)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project" (takes ~2 minutes)

### Step 2: Run SQL Schema

1. In your Supabase project, click **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy entire contents of `supabase-schema.sql`
4. Paste into the editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned"

This creates:
- ✅ `shared_cards` table
- ✅ Public access policies (no auth needed)
- ✅ Real-time subscriptions
- ✅ Auto-updating timestamps

### Step 3: Get Your API Credentials

1. Click **Settings** (gear icon in sidebar)
2. Click **API** in settings menu
3. Find two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
4. **Keep these safe!** You'll need them next

### Step 4: Configure Your App

**Option A: For Development**
1. Copy `.env.example` to `.env`
2. Fill in your values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```
3. Restart dev server: `npm run dev`

**Option B: For GitHub Pages Deployment**
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add two secrets:
   - Name: `VITE_SUPABASE_URL`, Value: your URL
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: your key
5. Update your GitHub Actions workflow (see below)

---

## GitHub Pages Deployment

### Update GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist
  
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

### Enable GitHub Pages

1. Go to repository **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

### Deploy

```bash
git add .
git commit -m "Add shared database"
git push origin main
```

Your site will be live at: `https://yourusername.github.io/repo-name`

---

## How It Works

### Data Flow

```
User Browser ←→ Supabase (PostgreSQL) ←→ Other Users
```

- No backend server needed
- Direct browser-to-database connection
- Real-time updates via WebSockets
- Supabase handles all the infrastructure

### Features

✅ **Real-time sync**: See others' changes instantly
✅ **No authentication**: Anyone can use it
✅ **Public access**: All cards visible to everyone
✅ **Collaborative editing**: Everyone can add/edit/delete
✅ **Offline support**: Falls back to localStorage if offline
✅ **Fast**: Direct database access, no API layer

### Data Storage Strategy

LearnFlow uses **dual storage**:

1. **Supabase (shared)**: Cards everyone can see
2. **localStorage (personal)**: Your learning progress

This means:
- ✅ Card content is shared
- ✅ Your study progress is private (box levels, reviews)
- ✅ Best of both worlds!

---

## Testing Your Setup

### Quick Test

1. Build and run locally:
```bash
npm install
npm run dev
```

2. Create a card in the app
3. Open Supabase **Table Editor**
4. Click **shared_cards** table
5. You should see your card!

### Real-time Test

1. Open your app in two browser windows
2. Add a card in window 1
3. It should appear in window 2 automatically!

---

## Security Considerations

### Public Database Warning

⚠️ **This is a PUBLIC database!**
- Anyone can see all cards
- Anyone can edit or delete cards
- No moderation or access control
- Suitable for trusted groups only

### For Untrusted Environments

If you need more control:
1. Enable Supabase Auth
2. Add user accounts
3. Implement moderation
4. Add rate limiting

(This requires code changes - contact for help!)

### Data Privacy

- Don't put sensitive information in cards
- Assume everything is public
- Anyone with the URL can access
- No deletion is permanent (check database backups)

---

## Cost & Limits

### Supabase Free Tier

- ✅ 500 MB database storage
- ✅ 2 GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ✅ Real-time subscriptions included

This is **more than enough** for most study groups!

### When to Upgrade

Upgrade to paid if you:
- Exceed 500 MB (thousands of cards)
- Exceed 2 GB bandwidth
- Need guaranteed uptime
- Want automatic backups
- Need customer support

---

## Troubleshooting

### Cards not syncing?

1. **Check Supabase status**: [status.supabase.com](https://status.supabase.com)
2. **Verify credentials**: Check .env values
3. **Check browser console**: Look for errors
4. **Test connection**: Visit Supabase dashboard

### Build fails on GitHub Pages?

1. **Verify secrets**: Settings → Secrets and variables
2. **Check workflow**: Must have env variables in build step
3. **View logs**: Actions tab → Click failed run

### Real-time not working?

1. **Check SQL**: Run schema again
2. **Enable realtime**: Database → Replication → Enable shared_cards
3. **Browser support**: Needs WebSocket support

### Database errors?

1. **RLS policies**: Make sure all 4 policies exist
2. **Table permissions**: Check in Table Editor
3. **API keys**: Regenerate if exposed

---

## Migration from Local-Only

If you have existing cards in localStorage:

1. **Export first**: Use Export feature → Save JSON
2. **Enable shared database**: Follow setup above
3. **Import to shared**: Use Import feature → Paste JSON
4. Your cards are now shared!

**Note**: Your personal progress (box levels, reviews) stays local.

---

## Advanced: Custom Domain

Want `learn.yourdomain.com` instead of GitHub Pages URL?

1. **Add CNAME**: In repo, create file `public/CNAME` with your domain
2. **Configure DNS**: Point to GitHub Pages
3. **Update repo settings**: Settings → Pages → Custom domain
4. **Wait for SSL**: GitHub auto-generates certificate

---

## Support & Community

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Discussions**: Create discussion in repo
- **Discord**: Join Supabase Discord

### Sharing Your Instance

Share your URL:
```
https://yourusername.github.io/learnflow
```

Everyone can:
- View all cards
- Add new cards
- Edit existing cards
- Delete cards
- See real-time updates

Perfect for study groups! 📚

---

## What's Next?

Possible enhancements:
- User accounts (optional login)
- Card ownership tracking
- Vote/like system
- Comments on cards
- Tag-based organization
- Search functionality
- Import from Quizlet

Let me know what features you'd like! 🚀
