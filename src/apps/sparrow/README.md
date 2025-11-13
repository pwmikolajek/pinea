# Sparrow - PDF Commenting App

A self-contained PDF commenting application integrated into the Pinea suite.

## Directory Structure

```
src/apps/sparrow/
├── components/          # Sparrow-specific components
│   ├── PdfRenderer.tsx      # PDF viewer with commenting
│   ├── PdfRenderer.css
│   └── PdfThumbnails.tsx    # Page thumbnails sidebar
├── pages/              # Sparrow pages
│   ├── Login.tsx           # Authentication pages
│   ├── Register.tsx
│   ├── Dashboard.tsx       # PDF list/dashboard
│   ├── PdfViewer.tsx       # PDF viewer page
│   ├── Auth.css           # Shared auth styles
│   ├── Dashboard.css
│   └── PdfViewer.css
├── contexts/           # Sparrow state management
│   └── AuthContext.tsx     # Authentication context (with Google OAuth)
├── services/           # API communication
│   └── api.ts             # Backend API calls
├── config/             # Configuration
│   └── firebase.ts        # Firebase configuration
├── types/              # TypeScript types
│   └── index.ts           # User, PDF, Comment types
└── routes.tsx          # Sparrow route configuration
```

## Design Principles

### 1. Complete Isolation
- All Sparrow code lives in `src/apps/sparrow/`
- No dependencies on Pinea-specific components
- Changes to Sparrow won't affect other Pinea tools

### 2. Self-Contained
- Has its own components, pages, contexts, services, and types
- Independent routing configuration
- Own styling (aligned with Pinea design system)

### 3. Easy Integration
- Simply import `sparrowRoutes` in `main.tsx`
- Add backend URL to `.env` file
- No complex setup required

## How It Works

### Authentication Flow

Sparrow supports two authentication methods:

#### 1. Google OAuth (Recommended)
- **Domain Restriction**: Only `@humanmade.com` email addresses can sign in
- **Powered by Firebase Authentication**
- One-click sign-in with Google account
- No password management required

#### 2. Email/Password
- Traditional email/password authentication
- Uses backend API for validation
- JWT tokens stored in localStorage

**Authentication Process**:
1. User visits `/sparrow/login` or `/sparrow/register`
2. Choose Google Sign-In or email/password
3. `AuthContext` manages authentication state
4. Protected routes check authentication status
5. Redirects to login if not authenticated

### PDF Workflow
1. Dashboard (`/sparrow/dashboard`) shows all PDFs
2. Upload new PDFs with title
3. View PDF (`/sparrow/pdf/:id`) opens viewer
4. Click anywhere on PDF to add position-based comment
5. Comments shown in right sidebar
6. Thumbnails shown in left sidebar

## Setup Instructions

### 1. Firebase Configuration (for Google OAuth)

To enable Google Sign-In with domain restriction:

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Google Analytics (optional)

2. **Enable Google Authentication**:
   - Navigate to **Authentication** → **Sign-in method**
   - Click on **Google** and enable it
   - Add your authorized domains (e.g., `localhost`, your production domain)
   - **Important**: Under "Advanced", set **Authorized domains** to include `humanmade.com`

3. **Get Your Firebase Config**:
   - Go to **Project Settings** (gear icon) → **General**
   - Scroll to "Your apps" section
   - Click "Add app" and select **Web** (</>) if you haven't already
   - Copy the configuration values

4. **Add to Environment Variables**:
   - Copy `.env.example` to `.env`
   - Fill in the Firebase configuration values:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Domain Restriction**:
   - The app is configured to only allow `@humanmade.com` emails
   - This is enforced in `src/apps/sparrow/contexts/AuthContext.tsx`
   - Users with other email domains will see an error message

### 2. Backend Integration (Optional for Email/Password Auth)

Sparrow can also work with a separate backend server:
- Node.js + Express + PostgreSQL
- Located in: `/Users/pawelmikolajek/Downloads/Sparrow v2/backend`
- Configure URL in `.env`: `VITE_SPARROW_API_URL=http://localhost:5001/api`

## Adding New Features

### Adding a New Page
1. Create component in `pages/`
2. Add route in `routes.tsx`
3. Use `useSparrowAuth()` for authentication

### Adding New API Endpoints
1. Add method to `services/api.ts`
2. Update types in `types/index.ts` if needed

### Adding Components
1. Create in `components/`
2. Import and use in pages
3. Keep styles co-located with component

## Best Practices

- **Don't** import from parent directories (`../../../`)
- **Do** keep all imports within `src/apps/sparrow/`
- **Don't** modify core Pinea files
- **Do** follow Pinea's design system colors
- **Don't** create global state outside AuthContext
- **Do** use TypeScript for type safety

## Future Apps

To add new apps to Pinea:
1. Create new directory: `src/apps/[app-name]/`
2. Follow same structure as Sparrow
3. Create `routes.tsx` for the app
4. Import routes in `main.tsx`

This keeps each app isolated and maintainable!
