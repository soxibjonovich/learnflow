# Quick Deployment Guide

## Two Deployment Options

### Option 1: Raspberry Pi (Local/Private)

**Best for:** Personal use, home network, private learning

```bash
# Extract files
tar -xzf learnflow-v5-shared-db.tar.gz -C learnflow
cd learnflow

# Deploy
chmod +x deploy.sh
./deploy.sh

# Access
http://localhost:3000
http://[your-pi-ip]:3000
```

**Features:**
- ✅ Complete privacy
- ✅ No internet required
- ✅ Local storage only
- ✅ Full control

---

### Option 2: GitHub Pages (Public/Shared)

**Best for:** Study groups, shared learning, collaboration

#### Step 1: Setup Repository

```bash
# Create GitHub repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/learnflow.git
git push -u origin main
```

#### Step 2: Setup Supabase (Free)

1. Go to [supabase.com](https://supabase.com)
2. Create new project (2 min setup)
3. Copy URL and anon key
4. Run `supabase-schema.sql` in SQL Editor

#### Step 3: Configure GitHub

1. Repository **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key

#### Step 4: Enable GitHub Pages

1. **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

#### Step 5: Deploy

```bash
# Push to trigger deployment
git push origin main

# Wait 2-3 minutes
# Access at: https://yourusername.github.io/learnflow
```

**Features:**
- ✅ Free hosting
- ✅ Shared database
- ✅ Real-time sync
- ✅ No server management
- ✅ HTTPS included

---

## Comparison

| Feature | Raspberry Pi | GitHub Pages |
|---------|-------------|--------------|
| **Cost** | One-time hardware | Free forever |
| **Privacy** | 100% private | Public database |
| **Collaboration** | Same network only | Anyone with URL |
| **Maintenance** | You manage | GitHub manages |
| **Internet** | Not required | Required |
| **Real-time sync** | No | Yes |
| **Setup time** | 5 minutes | 15 minutes |

---

## Which Should I Choose?

### Choose Raspberry Pi if:
- ✅ You want complete privacy
- ✅ You're learning alone
- ✅ You don't need internet access
- ✅ You already have a Raspberry Pi
- ✅ You want full control

### Choose GitHub Pages if:
- ✅ You're in a study group
- ✅ You want to share with others
- ✅ You need real-time collaboration
- ✅ You want zero maintenance
- ✅ You want free cloud hosting

---

## Can I Use Both?

**Yes!** Common setup:

1. **GitHub Pages** for shared card library
2. **Raspberry Pi** for offline study backup

Or:

1. **GitHub Pages** for your main study
2. **Raspberry Pi** for private/sensitive cards

---

## Need Help?

- **Raspberry Pi**: See `README.md` and `QUICKSTART.sh`
- **GitHub Pages**: See `SHARED-DATABASE-SETUP.md`
- **Issues**: Create GitHub issue
- **Questions**: Check documentation

Happy learning! 🎓
