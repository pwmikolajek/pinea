# Pinea Architecture

Pinea is a suite of browser-based productivity tools with a modular architecture.

## Project Structure

```
src/
├── apps/                    # Self-contained applications
│   └── sparrow/            # PDF Commenting app
│       ├── components/     # App-specific components
│       ├── pages/         # App pages
│       ├── contexts/      # App state
│       ├── services/      # App API calls
│       ├── types/         # App TypeScript types
│       └── routes.tsx     # App routing
├── components/             # Shared Pinea components
├── pages/                  # Core Pinea pages
│   ├── LandingPage.tsx    # Main landing page
│   ├── PdfToJpeg.tsx      # PDF to JPEG converter
│   └── ...
├── img/                    # Shared assets
├── utils/                  # Shared utilities
├── App.tsx                 # Image to PDF converter
├── main.tsx                # Main entry point
└── index.css               # Global styles
```

## Design Principles

### 1. Modularity
Each app in `src/apps/` is completely self-contained:
- Has its own components, pages, contexts, services, and types
- Independent routing configuration
- Can be developed, tested, and deployed independently
- Changes to one app don't affect others

### 2. Shared Foundation
Core Pinea provides:
- Design system (colors, shadows, borders)
- Landing page
- Basic tools (Image to PDF, PDF to JPEG)
- Shared utilities and assets

### 3. Client-Side First
- All processing happens in the browser
- No uploads to servers (except Sparrow which needs backend)
- Privacy-focused
- Fast and responsive

## Current Apps

### Core Pinea Tools
- **Image to PDF Converter** (`/image-to-pdf`)
- **PDF to JPEG Converter** (`/pdf-to-jpeg`)

### Sparrow - PDF Commenting (`/sparrow/*`)
- User authentication
- Upload and view PDFs
- Position-based commenting
- Multi-user collaboration
- **Backend Required**: Node.js + Express + PostgreSQL

## Adding New Apps

To add a new app to the Pinea suite:

1. **Create app directory**:
   ```bash
   mkdir -p src/apps/[app-name]/{components,pages,contexts,services,types}
   ```

2. **Create app structure**:
   - `routes.tsx` - Define app routes
   - `components/` - App-specific components
   - `pages/` - App pages
   - `types/` - TypeScript types
   - Optional: `contexts/`, `services/`, etc.

3. **Add to main routing**:
   ```typescript
   // In src/main.tsx
   import { newAppRoutes } from './apps/new-app/routes';

   const router = createBrowserRouter([
     // ... existing routes
     ...newAppRoutes,
   ]);
   ```

4. **Add to landing page**:
   ```typescript
   // In src/pages/LandingPage.tsx
   <AppCard
     title="New App"
     description="Description"
     icon={<Icon size={24} />}
     path="/new-app"
     status="available"
   />
   ```

## Design System

### Colors
- Background: `#F7F6F3` (warm beige)
- Cards: `#F9F8F6` (light beige)
- Text dark: `#3C3A33`
- Text medium: `#6C6A63`
- Accent: `#22c55e` (green)
- Borders: `rgba(108,106,99,0.10)`

### Shadows
```css
box-shadow:
  0px 100px 80px 0px rgba(108,106,99,0.02),
  0px 41.778px 33.422px 0px rgba(108,106,99,0.01),
  0px 22.336px 17.869px 0px rgba(108,106,99,0.01);
```

### Border Radius
- Cards: `15px`
- Buttons: `6-8px`
- Small elements: `4px`

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Custom CSS
- **PDF Processing**: PDF.js
- **Icons**: Lucide React

## Development Workflow

### Running Locally
```bash
npm run dev  # Start Vite dev server
```

### Building for Production
```bash
npm run build  # Build optimized bundle
npm run preview  # Preview production build
```

### For Sparrow (Backend Required)
```bash
cd "/path/to/Sparrow v2/backend"
npm start  # Start backend on port 5001
```

## Best Practices

### Do's ✅
- Keep apps self-contained in `src/apps/`
- Follow Pinea design system
- Use TypeScript for type safety
- Document new features
- Test in multiple browsers

### Don'ts ❌
- Don't import between apps
- Don't modify core files from apps
- Don't use global state outside app contexts
- Don't break privacy-first principle
- Don't add heavy dependencies without reason

## Future Roadmap

Planned apps:
- Meeting Notes Organizer (coming soon)
- Data Visualizer (coming soon)
- More productivity tools...

---

Built with 💚 by the Pinea team
