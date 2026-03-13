

---

## 🚀 Deploy to Production

### Quick Deploy
```bash
# Option 1: Use the deploy script
cd ~/.openclaw/workspace/urepp
chmod +x scripts/deploy.sh
./scripts/deploy.sh

# Option 2: Manual
vercel login
vercel --prod
```

### Detailed Instructions
See [DEPLOY.md](DEPLOY.md) for step-by-step deployment guide.

### Steps Summary
1. Push to GitHub
2. Deploy to Vercel (`vercel --prod`)
3. Add environment variables in Vercel dashboard
4. Update Supabase auth URLs
5. Done!

Your site will be live at `https://urepp.vercel.app` (or your custom domain).
