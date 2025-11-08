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
│   └── AuthContext.tsx     # Authentication context
├── services/           # API communication
│   └── api.ts             # Backend API calls
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
1. User visits `/sparrow/login` or `/sparrow/register`
2. `AuthContext` manages JWT tokens in localStorage
3. Protected routes check authentication status
4. Redirects to login if not authenticated

### PDF Workflow
1. Dashboard (`/sparrow/dashboard`) shows all PDFs
2. Upload new PDFs with title
3. View PDF (`/sparrow/pdf/:id`) opens viewer
4. Click anywhere on PDF to add position-based comment
5. Comments shown in right sidebar
6. Thumbnails shown in left sidebar

## Backend Integration

Sparrow requires a separate backend server:
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
