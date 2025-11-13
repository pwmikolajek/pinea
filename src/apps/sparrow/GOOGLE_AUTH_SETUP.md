# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication with domain restriction for the Sparrow PDF commenting app.

## Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)
- A domain to restrict access to (currently configured for `@humanmade.com`)

## Step-by-Step Setup

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter a project name (e.g., "Sparrow PDF Commenting")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

### 2. Enable Google Authentication

1. In your Firebase project, navigate to **Authentication** from the left sidebar
2. Click on the **"Get started"** button if this is your first time
3. Go to the **"Sign-in method"** tab
4. Find **"Google"** in the list of providers
5. Click on **Google** to expand it
6. Toggle the **"Enable"** switch
7. Enter a **Project support email** (your email address)
8. Click **"Save"**

### 3. Add Authorized Domains

1. Still in the **Authentication** → **Sign-in method** section
2. Scroll down to **"Authorized domains"**
3. By default, `localhost` should already be listed
4. Click **"Add domain"** to add your production domain (e.g., `your-app.vercel.app`)
5. Click **"Add"**

### 4. Get Firebase Configuration

1. Click on the **gear icon** (⚙️) next to "Project Overview" in the left sidebar
2. Select **"Project settings"**
3. Scroll down to the **"Your apps"** section
4. If you haven't created a web app yet:
   - Click the **"</>"** (web) icon to add a Firebase Web App
   - Give it a nickname (e.g., "Sparrow Web App")
   - **Do not** check "Set up Firebase Hosting"
   - Click **"Register app"**
5. You should see a `firebaseConfig` object with your credentials

### 5. Configure Environment Variables

1. Copy the Firebase configuration values
2. Open your `.env` file in the project root (create one if it doesn't exist)
3. Add the following variables with your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

4. Save the `.env` file

### 6. Domain Restriction Configuration

The domain restriction is already configured in the code to allow only `@humanmade.com` email addresses.

**To change the allowed domain:**

1. Open `src/apps/sparrow/contexts/AuthContext.tsx`
2. Find the line: `const ALLOWED_DOMAIN = 'humanmade.com';`
3. Change `'humanmade.com'` to your desired domain
4. Save the file

**To change the domain hint in Firebase:**

1. Open `src/apps/sparrow/config/firebase.ts`
2. Find the line: `hd: 'humanmade.com',`
3. Change `'humanmade.com'` to your desired domain
4. Save the file

### 7. Test the Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Sparrow login page: `http://localhost:5173/sparrow/login`

3. Click the **"Sign in with Google (@humanmade.com)"** button

4. Sign in with a Google account that has an `@humanmade.com` email address

5. If you try to sign in with a different domain, you should see an error message

## How It Works

### Domain Restriction

The domain restriction works in two places:

1. **Firebase Configuration** (`src/apps/sparrow/config/firebase.ts`):
   - The `hd` parameter in `googleProvider.setCustomParameters()` provides a hint to Google's OAuth screen
   - This pre-filters the account selection to show only accounts from the specified domain
   - **Note**: This is only a UI hint and can be bypassed

2. **Application-Level Validation** (`src/apps/sparrow/contexts/AuthContext.tsx`):
   - After successful Google sign-in, the app checks the user's email domain
   - If the email doesn't end with `@humanmade.com`, the user is signed out
   - An error message is displayed
   - **This is the actual security enforcement**

### Authentication Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup opens (filtered to show @humanmade.com accounts)
3. User selects an account and grants permission
4. Firebase returns user data
5. App validates the email domain
6. If valid: User is logged in and redirected to dashboard
7. If invalid: User is signed out and sees an error

### Token Storage

- Firebase authentication tokens are stored in `localStorage`
- Key: `sparrow_token`
- User data is also stored for quick access
- Auth provider type is tracked: `sparrow_auth_provider: 'google'`

## Troubleshooting

### "Firebase configuration not found" error

- Make sure all `VITE_FIREBASE_*` variables are set in your `.env` file
- Restart your development server after adding environment variables

### "Invalid API key" error

- Double-check that you copied the API key correctly from Firebase Console
- Make sure there are no extra spaces or quotes in the `.env` file

### Google OAuth popup blocked

- Check your browser's popup blocker settings
- Allow popups for your development domain

### "Only humanmade.com email addresses are allowed" error

- This is working as expected if you're using a non-@humanmade.com email
- To test with a different email, change the `ALLOWED_DOMAIN` constant in the code

### Authentication works locally but not in production

- Make sure you've added your production domain to Firebase's Authorized Domains
- Check that environment variables are set correctly in your hosting platform (e.g., Vercel)

## Security Considerations

1. **Client-Side Domain Restriction**: The domain check happens on the client side. For production use with a backend API, you should also validate the user's email domain on the server.

2. **Firebase Security Rules**: If you're using Firebase Database or Firestore, add security rules to enforce domain restrictions there as well.

3. **Token Validation**: If you have a backend API, validate the Firebase token on the server side using Firebase Admin SDK.

## Production Deployment

When deploying to production (e.g., Vercel):

1. Add your Firebase environment variables to your hosting platform's environment variables
2. Add your production domain to Firebase's Authorized Domains list
3. Update your OAuth redirect URIs if necessary
4. Test the authentication flow thoroughly

## Need Help?

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Console](https://console.firebase.google.com/)
