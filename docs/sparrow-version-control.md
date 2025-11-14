# Sparrow: PDF Version Control Implementation

**Date:** November 14, 2025
**Status:** Implemented and Functional

## Overview

Implemented a complete version control system for PDF projects in the Sparrow application. This allows designers to upload multiple versions of the same PDF while preserving the feedback history across iterations.

## Use Case

The system supports a collaborative workflow between two types of users:
- **Marketers**: Give feedback via comments on PDFs
- **Designers**: Upload updated versions of PDFs in response to feedback

## Architecture

### Data Structure

#### Project Type
```typescript
interface Project {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  current_version: number;
  versions: PDFVersion[];
}
```

#### PDFVersion Type
```typescript
interface PDFVersion {
  version_number: number;
  filename: string;
  file_path: string;
  uploaded_at: string;
  uploaded_by: string;
  uploaded_by_name: string;
  comment_count?: number;
}
```

#### Updated Comment Type
```typescript
interface Comment {
  // ... existing fields
  version_number?: number; // Links comment to specific version
}
```

### Storage

All project data is stored in localStorage under the key `sparrow_local_projects` when in local development mode.

PDF file data is stored in an in-memory `Map` (pdfFilesCache) to avoid localStorage quota limits (5-10MB).

## Implementation Details

### Files Modified

#### Core Services
- **`src/apps/sparrow/services/mockDataService.ts`**
  - Added `mockProjectService` with methods:
    - `create()`: Create new project with initial PDF version
    - `addVersion()`: Add new version to existing project
    - `getAll()`: Retrieve all projects with file URLs restored from cache
    - `getById()`: Get specific project by ID
    - `delete()`: Delete project and all its versions

#### Type Definitions
- **`src/apps/sparrow/types/index.ts`**
  - Added `Project` interface
  - Added `PDFVersion` interface
  - Updated `Comment` interface to include optional `version_number` field

#### Dashboard
- **`src/apps/sparrow/pages/Dashboard.tsx`**
  - Added state for projects and selectedProjectId
  - Updated `fetchData()` to load projects in local dev mode
  - Added project selector dropdown in upload form
  - Updated upload handler to create new project OR add version
  - Changed project cards to show:
    - Project title with current version badge
    - Creator name
    - Last updated date
    - Total number of versions
    - Latest version filename
  - Updated navigation to `/sparrow/project/${project.id}`

#### PDF Viewer
- **`src/apps/sparrow/pages/PdfViewer.tsx`**
  - Added support for project-based routing
  - Added state for `project` and `selectedVersion`
  - Detects view type via `location.pathname.startsWith('/sparrow/project/')`
  - Updated `fetchPdfAndComments()` to load project data
  - Added version selector dropdown in header showing:
    - Version number
    - Filename
    - Upload date
  - Version selector allows switching between versions
  - PDF URL updates based on selected version

#### Routing
- **`src/apps/sparrow/routes.tsx`**
  - Added new route: `/sparrow/project/:id` using same PdfViewer component

#### Styling
- **`src/apps/sparrow/pages/Dashboard.css`**
  - Updated all color schemes from bright greens to natural earth tones:
    - `#22c55e` → `#6C6A63` (warm gray-brown)
    - `#16a34a` → `#3C3A33` (darker warm brown)
    - `#dcfce7` → `#E8E6DE` (light beige)

- **`src/apps/sparrow/pages/PdfViewer.css`**
  - Added `.header-title-section` for flexible layout
  - Added `.version-selector` styles
  - Updated all color schemes to match Pinea aesthetic

### Color Scheme Update

All Sparrow components now use a consistent natural color palette:
- **Primary**: `#6C6A63` (warm gray-brown)
- **Hover**: `#3C3A33` (darker warm brown)
- **Background**: `#E8E6DE` (light beige)
- **Border**: `rgba(108,106,99,0.10)` (subtle borders)

Files updated:
- `Dashboard.tsx` - buttons and badges
- `Dashboard.css` - card headers, buttons
- `PdfViewer.css` - all interactive elements
- `Login.tsx` - buttons and accents
- `Register.tsx` - buttons and accents

## Features

### Dashboard Features

1. **Project Display**
   - Grid view of all projects
   - Each card shows project metadata and version info
   - "View & Comment" navigates to project viewer

2. **Upload Workflow**
   - "Upload PDF" button opens upload form
   - Project selector dropdown:
     - "New Project" option creates fresh project
     - Existing projects shown with current version
   - Title field:
     - Editable for new projects
     - Auto-filled and locked when adding version
   - File picker for PDF selection

3. **Version Management**
   - Automatic version numbering (v1, v2, v3...)
   - Latest version always displayed on project card
   - Version badge shows current version number

### PDF Viewer Features

1. **Version Selector**
   - Dropdown in header showing all versions
   - Format: "v{number} - {filename} ({date})"
   - Selecting version updates displayed PDF immediately

2. **Navigation**
   - Routes: `/sparrow/project/:id` for projects
   - Routes: `/sparrow/pdf/:id` for standalone PDFs (legacy)
   - Automatic detection of view type

3. **Metadata Display**
   - Project title in header
   - Creator name ("Created by...")
   - Current version indicator

## Workflow Example

1. **Initial Upload**
   - Marketer uploads "Brand Guidelines.pdf"
   - System creates Project "Brand Guidelines" with v1

2. **Feedback**
   - Marketer views PDF, adds comments on cover page
   - Comments saved with page location

3. **Designer Update**
   - Designer clicks "Upload PDF"
   - Selects "Brand Guidelines (v1)" from project dropdown
   - Uploads "Brand Guidelines v2.pdf"
   - System creates v2 in same project

4. **Review**
   - Marketer opens project, sees v2 in version selector
   - Can switch between v1 and v2 to compare
   - Original comments still visible (TODO: filter by version)

## Technical Notes

### LocalStorage Quota Handling

PDF files are stored as data URLs which can be very large (several MB each). To avoid quota errors:
- File data stored in `pdfFilesCache` Map (in-memory)
- Only metadata stored in localStorage
- File references use docId/versionId as key
- On page reload, cache is rebuilt as needed

### In-Memory Cache Structure

```typescript
const pdfFilesCache = new Map<string, string>();
// Key: versionId (e.g., "abc123_v1")
// Value: data URL of PDF file
```

### Version ID Generation

Format: `{projectId}_v{versionNumber}`
- Example: `abc123def456_v1`
- Example: `abc123def456_v2`

## Known Limitations

1. **Comments Not Version-Specific**: Comments are currently stored globally for the project, not linked to specific versions (line 89 in PdfViewer.tsx marked as TODO)

2. **Local Dev Mode Only**: Version control currently only works in local development mode with `VITE_LOCAL_DEV_MODE=true`

3. **No Comment Migration**: When uploading new version, comments from previous version are not automatically transferred or suggested

4. **No Version Comparison**: Cannot view two versions side-by-side

## Future Enhancements

### Short Term
- Link comments to specific versions
- Show which version each comment belongs to
- Filter comments by selected version
- Add "resolved in version X" indicator

### Medium Term
- Version comparison view (side-by-side)
- Comment migration tool when uploading new version
- Version changelog/release notes
- Download specific version

### Long Term
- Firebase/production mode support
- Version branching (e.g., "draft" vs "final" branches)
- Approval workflow for versions
- Version merging capabilities
- Analytics per version (views, comments, engagement)

## Testing Instructions

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:5173/sparrow/login`
3. Login with any credentials (e.g., `test@example.com`)
4. Click "Upload PDF"
5. Select PDF file, enter title (e.g., "Test Project")
6. Click "Upload" - creates v1
7. Click "Upload PDF" again
8. Select "Test Project (v1)" from dropdown
9. Select different PDF file
10. Click "Upload New Version" - creates v2
11. Click "View & Comment" on the project
12. Use version selector to switch between v1 and v2

## Configuration

Enable version control by setting in `.env.local`:
```bash
VITE_LOCAL_DEV_MODE=true
```

## Related Files

- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Sparrow Integration: [SPARROW_INTEGRATION.md](./SPARROW_INTEGRATION.md)
- Main README: [../README.md](../README.md)
- Documentation Index: [../NOTES.md](../NOTES.md)
