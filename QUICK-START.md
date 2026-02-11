# Quick Setup Instructions

## Extract the Archive

```bash
# Extract to current directory
tar -xzf learnflow-v5-complete.tar.gz

# Navigate into the directory
cd learnflow

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at: `http://localhost:5173`

## If You Get Package Errors

Make sure you're in the `learnflow` directory:

```bash
pwd
# Should show: /home/maxa/Projects/quizlet/learnflow

ls -la
# Should show: package.json, src/, index.html, etc.
```

## Next Steps

### For Local Development (No Database)
```bash
npm install
npm run dev
# Open http://localhost:5173
```

### For Shared Database + GitHub Pages
See `SHARED-DATABASE-SETUP.md` for complete instructions.

### For Raspberry Pi Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

**"Cannot find package.json"**
- Make sure you extracted the archive
- Navigate into the `learnflow` directory
- The structure should be: `learnflow/package.json`, not `learnflow/learnflow/package.json`

**"Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port already in use**
```bash
# Kill process on port 5173
kill -9 $(lsof -t -i:5173)

# Or use different port
npm run dev -- --port 3000
```

## Files Included

- ✅ `package.json` - Dependencies
- ✅ `src/` - Source code
- ✅ `index.html` - Entry point
- ✅ All config files (vite, tailwind, etc.)
- ✅ Documentation (README, guides)
- ✅ Example import files
- ✅ Deployment configs (Docker, GitHub Actions)
- ✅ Database schema (Supabase SQL)

Ready to code! 🚀
