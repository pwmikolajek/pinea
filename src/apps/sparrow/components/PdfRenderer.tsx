import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Comment } from '../types';
import './PdfRenderer.css';

// Set up PDF.js worker - using unpkg CDN with explicit version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
  pdfUrl: string;
  comments: Comment[];
  previewComment: { page_number: number; x_position: number; y_position: number } | null;
  externalPage?: number;
  showResolvedComments?: boolean;
  onAddComment: (pageNumber: number, x: number, y: number) => void;
  onCommentClick: (comment: Comment) => void;
  onToggleResolved: (comment: Comment) => void;
  onCommentMove: (comment: Comment, x: number, y: number) => void;
  onPdfLoad?: (pdfDoc: pdfjsLib.PDFDocumentProxy) => void;
  onPageChange?: (page: number) => void;
}

const PdfRenderer: React.FC<PdfRendererProps> = ({
  pdfUrl,
  comments,
  previewComment,
  showResolvedComments = true,
  onAddComment,
  onCommentClick,
  onToggleResolved,
  onCommentMove,
  onPdfLoad,
  onPageChange,
  externalPage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(0.6);
  const [hoveredComment, setHoveredComment] = useState<Comment | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingComment, setDraggingComment] = useState<Comment | null>(null);
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number } | null>(null);

  // Update current page when external page changes
  useEffect(() => {
    if (externalPage && externalPage !== currentPage) {
      setCurrentPage(externalPage);
    }
  }, [externalPage]);

  useEffect(() => {
    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
    // Cleanup function to cancel any ongoing render when component unmounts
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  // Add pinch-to-zoom support
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if this is a pinch gesture (ctrl+wheel or trackpad pinch)
      if (e.ctrlKey) {
        e.preventDefault();

        // Calculate zoom delta
        const delta = -e.deltaY;
        const zoomIntensity = 0.01;
        const newScale = scale + delta * zoomIntensity;

        // Clamp scale between 0.5 and 3
        const clampedScale = Math.max(0.5, Math.min(3, newScale));
        setScale(clampedScale);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  const loadPdf = async () => {
    try {
      setLoading(true);

      // PDF.js configuration with CORS headers
      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: false,
        httpHeaders: {},
      });

      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setLoading(false);
      if (onPdfLoad) {
        onPdfLoad(pdf);
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('Failed to load PDF. Please check the browser console for details.');
      setLoading(false);
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc) return;

    // Cancel any ongoing render task
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      // Render at 2x resolution for better quality (supersampling)
      const pixelRatio = window.devicePixelRatio || 2;
      const viewport = page.getViewport({ scale: scale * pixelRatio });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Scale canvas display size back down
      canvas.style.width = `${viewport.width / pixelRatio}px`;
      canvas.style.height = `${viewport.height / pixelRatio}px`;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      // Store the render task so we can cancel it if needed
      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;
    } catch (error: any) {
      // Ignore cancellation errors
      if (error.name !== 'RenderingCancelledException') {
        console.error('Error rendering page:', error);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Calculate relative coordinates (0-1 range)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    onAddComment(currentPage, x, y);
  };

  // Unified pointer event handlers (works for both mouse and touch, especially reliable in Safari)
  const handlePointerDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent, comment: Comment) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDraggingComment(comment);
    setHoveredComment(null);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggingComment) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Get coordinates from either mouse or touch event
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    // Clamp to 0-1 range
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    setTempPosition({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !draggingComment) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Get coordinates from either mouse or touch event
    let clientX: number, clientY: number;
    if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      // If we can't get coordinates, just cancel the drag
      setIsDragging(false);
      setDraggingComment(null);
      setTempPosition(null);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      return;
    }

    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    // Clamp to 0-1 range
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    // Save the new position
    onCommentMove(draggingComment, clampedX, clampedY);

    // Reset dragging state
    setIsDragging(false);
    setDraggingComment(null);
    setTempPosition(null);

    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  // Filter comments for current page and resolved status
  const pageComments = comments.filter(
    (comment) =>
      comment.page_number === currentPage &&
      (showResolvedComments || !comment.resolved)
  );

  // Check if preview comment is on current page
  const showPreview = previewComment && previewComment.page_number === currentPage;

  return (
    <div className="pdf-renderer">
      <div className="pdf-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
        <div className="zoom-controls">
          <button onClick={handleZoomOut}>-</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn}>+</button>
        </div>
      </div>

      <div className="pdf-container" ref={containerRef}>
        {loading ? (
          <div className="pdf-loading">Loading PDF...</div>
        ) : (
          <div
            className="pdf-canvas-wrapper"
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            onTouchCancel={handlePointerUp}
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="pdf-canvas"
            />
            {pageComments.map((comment) => {
              // Use temp position if this comment is being dragged
              const isBeingDragged = draggingComment?.id === comment.id;
              const xPos = isBeingDragged && tempPosition ? tempPosition.x : parseFloat(String(comment.x_position));
              const yPos = isBeingDragged && tempPosition ? tempPosition.y : parseFloat(String(comment.y_position));

              return (
                <React.Fragment key={comment.id}>
                  <div
                    className={`comment-marker ${comment.resolved ? 'resolved' : ''} ${
                      isBeingDragged ? 'dragging' : ''
                    }`}
                    style={{
                      left: `${xPos * 100}%`,
                      top: `${yPos * 100}%`,
                    }}
                    onMouseDown={(e) => handlePointerDown(e, comment)}
                    onTouchStart={(e) => handlePointerDown(e, comment)}
                    onClick={(e) => {
                      if (!isDragging) {
                        e.stopPropagation();
                        onCommentClick(comment);
                      }
                    }}
                    onMouseEnter={() => !isDragging && setHoveredComment(comment)}
                    onMouseLeave={() => setHoveredComment(null)}
                  >
                    <div className="comment-marker-icon"></div>
                  </div>
                {hoveredComment && hoveredComment.id === comment.id && draggingComment === null && (
                  <div
                    className="comment-preview-popup"
                    style={{
                      left: `${parseFloat(String(comment.x_position)) * 100}%`,
                      top: `${parseFloat(String(comment.y_position)) * 100}%`,
                    }}
                    onMouseEnter={() => setHoveredComment(comment)}
                    onMouseLeave={() => setHoveredComment(null)}
                  >
                    <div className="comment-preview-header">
                      <strong>{comment.user_name}</strong>
                      <span className="comment-preview-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="comment-preview-content">{comment.content}</div>
                    <div className="comment-preview-footer">
                      <label className="comment-resolved-checkbox">
                        <input
                          type="checkbox"
                          checked={comment.resolved || false}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleResolved(comment);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>{comment.resolved ? 'Resolved' : 'Mark as resolved'}</span>
                      </label>
                    </div>
                  </div>
                )}
              </React.Fragment>
              );
            })}
            {showPreview && (
              <div
                className="comment-marker comment-marker-preview"
                style={{
                  left: `${parseFloat(String(previewComment.x_position)) * 100}%`,
                  top: `${parseFloat(String(previewComment.y_position)) * 100}%`,
                }}
                title="New comment (unsaved)"
              >
                <div className="comment-marker-icon">💬</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfRenderer;
