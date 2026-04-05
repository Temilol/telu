# GitHub Actions Deployment Setup

This project uses GitHub Actions to automatically build and deploy your seating site with the admin password injected from GitHub Secrets.

## Setup Instructions

### 1. Add GitHub Secret

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `ADMIN_PASSWORD`
5. Value: `_ADMIN_PASSWORD_`
6. Click **Add secret**

### 2. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under "Source", select **Deploy from a branch**
3. Select branch: `gh-pages` (this will be created by the action)
4. Click **Save**

### 3. Configure Custom Domain (Optional)

If you have a custom domain:

1. Edit `.github/workflows/deploy.yml`
2. Update the `cname` field in the deploy step:
   ```yaml
   cname: your-domain.com
   ```
3. Add a CNAME record in your DNS pointing to `your-username.github.io`

## How It Works

When you push to `main`:

1. **GitHub Secrets** → `ADMIN_PASSWORD` secret is retrieved
2. **Create .env** → Workflow creates a temporary `.env` file with the password
3. **Build** → `node build-auth.js` generates `js/seating-auth.js` with the password injected
4. **Deploy** → Files are published to GitHub Pages branch (`gh-pages`)
5. **Cleanup** → `.env` is deleted (never stored in the repository)

## Workflow File

The workflow is in `.github/workflows/deploy.yml` and runs on:

- ✅ Every push to `main`
- ✅ Every pull request to `main`

## Important Security Notes

✅ `.env` is **never** committed to git  
✅ `ADMIN_PASSWORD` is stored as a GitHub Secret, not in code  
✅ `seating-auth.js` is generated fresh on each build  
✅ `.github/workflows/deploy.yml` is safe to commit (no secrets hardcoded)

## Test the Workflow

1. Push any change to a file to `main`
2. Go to **Actions** tab in GitHub
3. Watch the workflow run
4. Check GitHub Pages deployment status

## Troubleshooting

**Workflow fails with "ADMIN_PASSWORD not found"**

- Verify the secret is set in Settings → Secrets & variables

**GitHub Pages not deploying**

- Check that `gh-pages` branch is set as the source in Settings → Pages
- Verify GitHub Pages is enabled for your repository

**seating-auth.js not generating**

- Run locally: `cp .env.example .env && node build-auth.js`
- Check GitHub Actions logs for the exact error
