# Pinea Architecture Documentation

## Project Overview

Pinea is a modular React application consisting of four independent "bird-themed" microtools, each designed to be self-contained while sharing common resources through a centralized core.

## Directory Structure

```
src/
├── apps/                    # Self-contained bird-themed applications
│   ├── robin/              # Image to PDF
│   │   ├── components/     # DropZone, ImageList, DroppableWrapper
│   │   ├── pages/         # RobinApp.tsx
│   │   ├── utils/         # pdfGenerator.ts
│   │   └── types.ts       # ImageFile interface
│   ├── falcon/            # PDF to JPEGs
│   │   ├── components/    # PdfDropZone, ExtractedImagesList
│   │   ├── pages/        # FalconApp.tsx
│   │   ├── utils/        # pdfExtractor.ts
│   │   └── types.ts      # PdfPageImage interface
│   ├── sparrow/          # PDF Commenting
│   │   ├── components/   # PdfRenderer, PdfThumbnails
│   │   ├── contexts/     # AuthContext
│   │   ├── pages/        # Login, Register, Dashboard, PdfViewer
│   │   ├── services/     # api.ts
│   │   ├── types/        # index.ts
│   │   └── routes.tsx    # Sparrow routing
│   └── swift/            # YouTube Downloader
│       └── pages/        # SwiftApp.tsx
├── core/                 # Shared resources
│   ├── assets/          # logo.svg, add.svg
│   ├── components/      # LandingPage.tsx
│   ├── styles/          # index.css
│   └── utils/           # environmentalImpact.ts
└── main.tsx             # App entry point
```

## Design Principles

### 1. Modularity
Each app in `src/apps/` is completely self-contained:
- Has its own components, pages, utils, and types
- Independent routing (except main entry)
- Can be developed and tested independently
- Changes to one app don't affect others

### 2. Shared Foundation
Core provides:
- Design system (colors, shadows, borders)
- Landing page with app cards
- Shared utilities (environmental impact)
- Global assets (logo, icons)
- Base styling (Tailwind + custom CSS)

### 3. Client-Side First
- All processing happens in the browser
- No uploads to servers (Robin, Falcon)
- Privacy-focused
- Fast and responsive

## Bird-Themed Apps

### 1. Robin - Image to PDF
**Path**: `/image-to-pdf`
**Purpose**: Convert multiple images to a single PDF document

**Key Features:**
- Drag & drop image upload
- Sortable image list with @dnd-kit
- Image preview thumbnails
- Environmental impact tracking
- 100% client-side processing with jspdf

**Components:**
- `DropZone.tsx` - File upload with drag & drop
- `ImageList.tsx` - Sortable list of images
- `DroppableWrapper.tsx` - Drag & drop context

**Utils:**
- `pdfGenerator.ts` - Creates PDF from image array

### 2. Falcon - PDF to JPEGs
**Path**: `/pdf-to-jpeg`
**Purpose**: Extract all pages from PDF as high-quality JPEG images

**Key Features:**
- Adjustable quality settings (10% - 100%)
- Resolution scaling (0.5x - 3x)
- Download individual pages or all as ZIP
- Live preview of extracted images
- Environmental impact tracking
- 100% client-side with pdfjs-dist

**Components:**
- `PdfDropZone.tsx` - PDF file upload
- `ExtractedImagesList.tsx` - Grid of extracted images

**Utils:**
- `pdfExtractor.ts` - PDF rendering and JPEG extraction

### 3. Sparrow - PDF Commenting
**Path**: `/sparrow/*`
**Purpose**: Collaborative PDF annotation with real-time comments

**Key Features:**
- User authentication (JWT)
- Upload and view PDFs
- Drag & drop comments anywhere on PDF
- Multi-user collaboration
- Comment resolution tracking
- PDF version management

**Backend Required**: Separate Node.js + Express + PostgreSQL server

**Structure:**
- Full auth flow (Login/Register/Dashboard)
- Protected routes with AuthContext
- API service layer for backend communication
- Real-time comment positioning

### 4. Swift - YouTube Downloader
**Path**: `/yt-dlp`
**Purpose**: Download YouTube videos for content creation

**Key Features:**
- Multiple quality options (Best, 1080p, 720p, Audio)
- Progress tracking
- Direct download to device
- Format selection

**Backend**: Node.js + Express + yt-dlp on port 5002

## Routing Architecture

### Main Router (`main.tsx`)

```typescript
const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/image-to-pdf', element: <RobinApp /> },
  { path: '/pdf-to-jpeg', element: <FalconApp /> },
  { path: '/yt-dlp', element: <SwiftApp /> },
  ...sparrowRoutes  // Sub-router for Sparrow
]);
```

### Sparrow Sub-Router
Handles authentication-protected routes:
- `/sparrow/login` - Login page
- `/sparrow/register` - Registration page
- `/sparrow/dashboard` - PDF list (protected)
- `/sparrow/pdf/:id` - PDF viewer with commenting (protected)

## Import Patterns

### Cross-Module Imports (App → Core)
```typescript
// Assets
import logo from '../../../core/assets/logo.svg';
import addIcon from '../../../core/assets/add.svg';

// Utilities
import { calculateEnvironmentalImpact, formatEnvironmentalImpact }
  from '../../../core/utils/environmentalImpact';

// Components
import LandingPage from '../../../core/components/LandingPage';
```

### Intra-Module Imports (Within App)
```typescript
import Component from '../components/Component';
import { someUtil } from '../utils/someUtil';
import { SomeType } from '../types';
```

## Shared Utilities

### Environmental Impact Calculator
**Location**: `src/core/utils/environmentalImpact.ts`
**Used by**: Robin, Falcon

**Purpose**: Calculate environmental savings from going digital

```typescript
// Calculate impact
const impact = calculateEnvironmentalImpact(fileSize, pageCount);
// Returns: { treesSaved: number, co2Saved: number }

// Format for display
const message = formatEnvironmentalImpact(impact);
// Returns: "0.05% of a tree" or "1.23 trees"
```

## Styling Strategy

### Global Styles
**Location**: `src/core/styles/index.css`

- Tailwind CSS utility-first
- Custom grid background pattern
- Consistent typography scale
- Color system with CSS variables

### Design Tokens
```css
/* Colors */
Primary Green: #10b981 (green-600)
Text Dark: #3C3A33
Text Medium: #6C6A63
Background: #F9F8F6
Border: rgba(108,106,99,0.10)

/* Border Radius */
Cards: 15px
Buttons: 6-8px
Small: 4px

/* Shadows */
Multi-layer shadow for depth
```

### Component Styling
- Inline Tailwind classes for components
- Consistent button and card patterns
- Hover states for interactivity

## State Management

### App-Level State
- React `useState` for local component state
- No global state management (Redux/Zustand) needed
- Each app manages its own state independently

### Sparrow Authentication
- Custom `AuthContext` with `AuthProvider`
- JWT token in localStorage
- Protected route wrapper pattern

## Backend Architecture

### Swift Backend (`backend/server.js`)
**Port**: 5002

**Endpoints:**
- `POST /api/download` - Initiate YouTube download
  - Body: `{ url, format }`
  - Response: `{ success, downloadUrl, error }`
- `GET /downloads/:filename` - Serve downloaded file

**Features:**
- Express server with CORS
- yt-dlp integration for video processing
- File cleanup after download
- Progress simulation

**Download Flow:**
1. Client sends YouTube URL + format
2. Server validates and spawns yt-dlp
3. Video downloaded to `backend/downloads/`
4. Server returns download URL
5. Client triggers browser download
6. Files cleaned up after serving

## Adding a New Bird App

1. **Create directory structure**
   ```bash
   mkdir -p src/apps/[bird-name]/{components,pages,utils}
   touch src/apps/[bird-name]/types.ts
   ```

2. **Create main page component**
   ```typescript
   // src/apps/[bird-name]/pages/[BirdName]App.tsx
   export default function BirdNameApp() {
     return <div>New Bird App</div>;
   }
   ```

3. **Add route to main.tsx**
   ```typescript
   import BirdNameApp from './apps/[bird-name]/pages/BirdNameApp';

   const router = createBrowserRouter([
     // ...
     { path: '/bird-route', element: <BirdNameApp /> },
   ]);
   ```

4. **Add card to landing page**
   ```typescript
   <AppCard
     title="BirdName - Description"
     description="What the app does"
     icon={<Icon size={24} />}
     path="/bird-route"
     status="available"
   />
   ```

5. **Implement app features** following existing patterns

## Technology Stack

### Core Dependencies
- **React** 18.x - UI framework
- **TypeScript** 5.x - Type safety
- **Vite** 6.x - Build tool & dev server
- **React Router** 6.x - Client-side routing
- **Tailwind CSS** 3.x - Utility-first CSS

### App-Specific Dependencies
- **Robin**: `jspdf`, `@dnd-kit/*`
- **Falcon**: `pdfjs-dist`, `jszip`
- **Sparrow**: `axios`, `pdfjs-dist`
- **Swift**: Backend only (`express`, `cors`)

### Dev Dependencies
- ESLint - Code linting
- PostCSS - CSS processing
- Autoprefixer - Browser prefixes

## Performance Considerations

### Current Optimizations
- Vite code splitting and tree shaking
- Image lazy loading where applicable
- Efficient PDF rendering with canvas

### Future Improvements
- React.lazy() for route-based code splitting
- Web Workers for heavy PDF processing
- Service Worker for offline capability
- Image optimization pipeline

## Security & Privacy

### Client-Side Apps (Robin, Falcon)
- All processing in browser sandbox
- No server uploads
- No external API calls
- No tracking or analytics
- Files never leave user's device

### Server-Dependent Apps (Sparrow, Swift)
- CORS properly configured
- JWT authentication (Sparrow)
- Input validation on backend
- File type restrictions
- Automatic cleanup of temporary files

## Testing Strategy

### Current State
- Manual testing in development
- Browser compatibility testing

### Recommended Additions
- Unit tests for utilities (Vitest)
- Component tests (React Testing Library)
- E2E tests for critical flows (Playwright)
- Visual regression testing

## Deployment

### Frontend
```bash
npm run build        # Output to dist/
```
- Deploy `dist/` to static hosting (Vercel, Netlify, etc.)
- All apps included in single bundle

### Backend (Swift)
```bash
cd backend
node server.js
```
- Deploy to Node.js hosting
- Requires yt-dlp binary installed on server
- Set correct port and CORS origins

## Naming Conventions

### Files & Directories
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `types.ts` or `types/index.ts`
- Pages: `[BirdName]App.tsx`
- Directories: `lowercase` or `kebab-case`

### Code
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### Routing
- App routes: `/kebab-case`
- Bird names in code: `PascalCase`
- Bird names in UI: Title Case with dash

## Future Enhancements

### Potential Improvements
1. **Code Splitting**: React.lazy() for route-based splitting
2. **Web Workers**: Offload PDF processing to background
3. **PWA**: Service Worker for offline functionality
4. **Testing**: Comprehensive unit and E2E tests
5. **i18n**: Multi-language support
6. **Themes**: Dark mode support
7. **Analytics**: Privacy-respecting usage analytics

### Scalability
- Current architecture supports unlimited apps
- Shared utilities prevent code duplication
- Clear boundaries enable independent deployment
- Modular structure allows selective loading

## Best Practices

### Do's ✅
- Keep apps self-contained in `src/apps/`
- Follow Pinea design system for consistency
- Use TypeScript for type safety
- Share common utilities through `core/`
- Document new features and patterns
- Test in multiple browsers

### Don'ts ❌
- Don't import code between apps (except core)
- Don't modify core files from within apps
- Don't use global state outside app contexts
- Don't break the privacy-first principle
- Don't add dependencies without justification
- Don't commit sensitive data or API keys

---

**Last Updated**: November 9, 2025
**Architecture Version**: 2.0.0 (Post-Restructure)
