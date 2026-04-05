# Building Seating Auth with Environment Variables

The admin password is stored in a `.env` file (not committed to git) and injected into the JavaScript during the build process.

## Setup

1. **Copy the example env file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set your admin password:**
   ```bash
   ADMIN_PASSWORD=your_secure_password_here
   ```

3. **Run the build script before deploying:**
   ```bash
   node build-auth.js
   ```

   This generates `js/seating-auth.js` with your password injected from the `.env` file.

## For Deployments

### Local Development
- Edit `.env` with your password
- Run `node build-auth.js`
- Test the site locally
- Commit `js/seating-auth.js` (the generated file with password)

### GitHub Pages + GitHub Actions (Optional)
If you want to automate this:
1. Add your password as a GitHub Secret: `ADMIN_PASSWORD`
2. Create a GitHub Action workflow that:
   - Checks out the code
   - Creates `.env` with the secret from GitHub Secrets
   - Runs `node build-auth.js`
   - Commits and deploys

## Security Notes

- ✅ `.env` is in `.gitignore` - password never committed to git
- ✅ `seating-auth.js.template` doesn't contain the real password
- ✅ `seating-auth.js` is generated at build time and contains the password
- ⚠️ The generated `seating-auth.js` is visible in the browser - this is client-side auth, so it provides security through obscurity, not cryptographic security
