# Pinea Redeployment Notes

## Security Cleanup Completed (2025-11-13)

### What Was Done:
1. ✅ Added `.env` to `.gitignore` to prevent future commits
2. ✅ Removed `.env` file from entire git history using `git filter-branch`
3. ✅ Force pushed cleaned history to GitHub
4. ✅ Removed Vercel project (all deployments and environment variables deleted)

### Why This Was Necessary:
The `.env` file containing Firebase credentials and Vercel Blob token was accidentally committed to git history in commit `35113bbb`. This exposed sensitive credentials in the public repository.

---

## CRITICAL: Rotate Credentials Before Redeploying

⚠️ **These credentials were exposed in git history and must be regenerated:**

### 1. Firebase Credentials

**Steps to Rotate:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Under **Web API Key**, generate a new API key
5. Consider regenerating the entire Firebase config if needed

**What to update in `.env`:**
```
VITE_FIREBASE_API_KEY=<new_api_key>
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project_id>
VITE_FIREBASE_STORAGE_BUCKET=<project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
VITE_FIREBASE_APP_ID=<app_id>
```

### 2. Vercel Blob Token

**Steps to Get New Token:**
- When you create a new Vercel project, you'll need to create a new Blob store
- Vercel will automatically generate a new `BLOB_READ_WRITE_TOKEN`
- Add this to Vercel environment variables (see deployment steps below)

**Note:** All existing Blob storage data (PDFs) was deleted when the project was removed.

---

## Redeployment Steps

### Prerequisites:
- [ ] Firebase credentials have been rotated
- [ ] Local `.env` file is updated with new credentials
- [ ] Vercel CLI is installed: `npm i -g vercel`

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Test Locally (Optional)
```bash
npm run dev
```

### Step 3: Deploy to Vercel
```bash
vercel --prod
```

**During deployment, Vercel will ask:**
- Project name (suggest: `pinea-pdf-converter`)
- Build command: (keep default)
- Output directory: (keep default)

### Step 4: Configure Vercel Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Add these variables:**

| Variable Name | Value | Environments |
|--------------|-------|--------------|
| `VITE_FIREBASE_API_KEY` | Your new Firebase API key | Production |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project>.firebaseapp.com` | Production |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase project ID | Production |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<project>.appspot.com` | Production |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | Production |
| `VITE_FIREBASE_APP_ID` | Your Firebase app ID | Production |

### Step 5: Set Up Vercel Blob Storage

1. In Vercel Dashboard → Your Project → Storage
2. Click **Create Database**
3. Select **Blob**
4. Create a new Blob store
5. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables

### Step 6: Redeploy After Adding Variables
```bash
vercel --prod
```

### Step 7: Verify Firebase Configuration

1. Go to Firebase Console → Authentication → Sign-in method
2. Ensure **Google** provider is enabled
3. Under **Authorized domains**, add your Vercel deployment domain:
   - `<your-project>.vercel.app`
   - `<your-project>-<hash>.vercel.app`

---

## Firestore Database Setup

If you need to recreate the Firestore indexes:

### Required Composite Index:
- **Collection:** `comments`
- **Fields indexed:**
  - `pdf_id` (Ascending)
  - `created_at` (Ascending)

**To create:**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click **Add Index**
3. Set Collection ID: `comments`
4. Add fields as above

---

## Application Features

### Apps Included:
1. **Robin** - Image to PDF converter (browser-based, no server)
2. **Falcon** - PDF to JPEG converter (browser-based, no server)
3. **Swift** - YouTube downloader (browser-based, no server)
4. **Sparrow** - PDF commenting (uses Firebase + Vercel Blob)

### Authentication:
- Sparrow uses Google OAuth with `@humanmade.com` domain restriction
- Domain restriction is enforced client-side in `AuthContext.tsx`

### Storage:
- **Vercel Blob:** Stores PDF files (500MB free tier)
- **Firebase Firestore:** Stores PDF metadata and comments
- **Firebase Auth:** Handles Google OAuth authentication

---

## Security Best Practices

### Never Commit These Files:
- `.env`
- `.env.local`
- `.env.production`
- Any file containing API keys or secrets

### Always Check Before Committing:
```bash
git status  # Look for .env files
git diff    # Review what's being committed
```

### If `.env` Gets Committed Again:
1. Immediately rotate all credentials
2. Run the cleanup process again
3. Force push cleaned history

---

## Production URLs (Previous Deployment)

**Last deployed:** 2025-11-13
**URL:** https://pinea-pdf-converter-r9rt18q6z-pawel-mikolajeks-projects.vercel.app (now deleted)

New deployment will have a different URL.

---

## Contact & Support

- **Repository:** https://github.com/pwmikolajek/pinea
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## Notes

- Local `.env` file still exists and contains the old (exposed) credentials
- Update `.env` with new credentials before redeploying
- All Vercel Blob storage data was deleted when the project was removed
- Firebase data (Firestore, Auth users) is still intact
- The git history is now clean - `.env` file has been completely removed
