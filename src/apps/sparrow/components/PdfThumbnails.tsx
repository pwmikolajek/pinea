import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Comment } from '../types';

interface PdfThumbnailsProps {
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  currentPage: number;
  onPageClick: (pageNum: number) => void;
  comments: Comment[];
}

const PdfThumbnails: React.FC<PdfThumbnailsProps> = ({
  pdfDoc,
  currentPage,
  onPageClick,
  comments,
}) => {
  const [thumbnails, setThumbnails] = useState<number[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const renderTasksRef = useRef<Map<number, pdfjsLib.RenderTask>>(new Map());

  useEffect(() => {
    if (!pdfDoc) return;

    const generateThumbnails = async () => {
      const thumbs: number[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        thumbs.push(i);
      }
      setThumbnails(thumbs);
    };

    generateThumbnails();
  }, [pdfDoc]);

  useEffect(() => {
    if (!pdfDoc || thumbnails.length === 0) return;

    const renderThumbnail = async (pageNum: number) => {
      try {
        // Cancel any existing render task for this page
        const existingTask = renderTasksRef.current.get(pageNum);
        if (existingTask) {
          existingTask.cancel();
          renderTasksRef.current.delete(pageNum);
        }

        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRefs.current[pageNum - 1];
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Render at higher resolution for better quality
        const scale = 0.5;
        const viewport = page.getViewport({ scale });

        // Set canvas size to the viewport size
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTasksRef.current.set(pageNum, renderTask);

        await renderTask.promise;
        renderTasksRef.current.delete(pageNum);
      } catch (error: any) {
        // Ignore cancellation errors
        if (error?.name !== 'RenderingCancelledException') {
          console.error(`Error rendering thumbnail for page ${pageNum}:`, error);
        }
        renderTasksRef.current.delete(pageNum);
      }
    };

    // Render thumbnails sequentially to avoid conflicts
    const renderSequentially = async () => {
      for (const pageNum of thumbnails) {
        await renderThumbnail(pageNum);
      }
    };

    renderSequentially();

    // Cleanup function to cancel all render tasks
    return () => {
      renderTasksRef.current.forEach((task) => {
        task.cancel();
      });
      renderTasksRef.current.clear();
    };
  }, [pdfDoc, thumbnails]);

  const getCommentsForPage = (pageNum: number) => {
    return comments.filter((comment) => comment.page_number === pageNum).length;
  };

  if (!pdfDoc) return null;

  return (
    <div className="thumbnails-section">
      <h3>Pages</h3>
      <div className="thumbnail-list">
        {thumbnails.map((pageNum) => {
          const commentCount = getCommentsForPage(pageNum);
          return (
            <div
              key={pageNum}
              className={`thumbnail-item ${currentPage === pageNum ? 'active' : ''}`}
              onClick={() => onPageClick(pageNum)}
            >
              <canvas
                ref={(el) => (canvasRefs.current[pageNum - 1] = el)}
                className="thumbnail-canvas"
              />
              <div className="thumbnail-info">
                <span className="thumbnail-page-num">Page {pageNum}</span>
                {commentCount > 0 && (
                  <span className="thumbnail-comment-count has-comments">
                    {commentCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PdfThumbnails;
