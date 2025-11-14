# Pinea Changelog

## [Unreleased] - 2025-01-08

### Added - Sparrow (PDF Commenting App)

#### Draggable Comment Markers
- **Feature**: Users can now drag and drop comment markers to reposition them on PDFs
- **Implementation**: Mouse-based drag system for Safari compatibility
- **UX**: Optimistic UI updates prevent flickering during position saves
- **Visual**: Comment markers now show as clean green-bordered circles (removed emoji)
- **Backend**: Updated comment API to support position updates (x_position, y_position)

#### Technical Improvements
- Fixed PDF.js thumbnail rendering to prevent concurrent canvas operations
- Implemented sequential thumbnail rendering to avoid conflicts
- Added proper render task cancellation and cleanup
- Improved drag visual feedback with real-time position updates
- Comment markers fade to 80% opacity while dragging

#### Bug Fixes
- Fixed TypeError in comment hover popup (relatedTarget.closest)
- Resolved CSS syntax errors in PdfRenderer.css
- Fixed Safari drag-and-drop compatibility issues by switching to mouse events
- Prevented comment markers from blocking drop events with pointer-events: none

### Modified Files
- `src/apps/sparrow/components/PdfRenderer.tsx` - Added mouse-based drag handlers
- `src/apps/sparrow/components/PdfRenderer.css` - Updated marker styles for dragging
- `src/apps/sparrow/components/PdfThumbnails.tsx` - Fixed concurrent rendering
- `src/apps/sparrow/pages/PdfViewer.tsx` - Added optimistic UI updates
- `src/apps/sparrow/services/api.ts` - Extended update API for positions
- `/Sparrow v2/backend/src/controllers/commentController.js` - Support position updates

### Design Changes
- Comment markers: Simple green-bordered circles (20px, #22c55e)
- Removed emoji-based markers for cleaner appearance
- Cursor changes: grab → grabbing during drag
- Resolved comments: Show green checkmark inside circle

---

## Notes
This update focuses on improving the comment positioning UX in Sparrow, making it easy to adjust comment locations after initial placement. The switch from HTML5 drag API to mouse events ensures cross-browser compatibility, especially with Safari.
