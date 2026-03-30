# Git & GitHub Configuration

## Repository Info
- **GitHub URL:** https://github.com/omidhb/english-website
- **Remote name:** origin
- **Default branch:** main

## Git User Config
- **Username:** omidhb
- **Email:** hajbagheri.o@gmail.com

## Common Commands

```bash
# Push to GitHub
git add .
git commit -m "feat: description"
git push origin main

# Pull latest
git pull origin main

# Check status
git status && git log --oneline -5
```

## Auth Note
Remote URL uses a Personal Access Token (PAT).
If push fails with 401/403, the token may be expired.
Generate a new one at: https://github.com/settings/tokens
Then update with:
```bash
git remote set-url origin https://<NEW_TOKEN>@github.com/omidhb/english-website.git
```
