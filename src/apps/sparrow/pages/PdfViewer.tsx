import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSparrowAuth } from '../contexts/AuthContext';
import { pdfService, commentService } from '../services/firebaseService';
import { mockProjectService, mockCommentService } from '../services/mockDataService';
import { isLocalDevMode } from '../config/localDev';
import PdfRenderer from '../components/PdfRenderer';
import PdfThumbnails from '../components/PdfThumbnails';
import { PDF, Comment, CommentData, Project } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import './PdfViewer.css';

type CommentWithFirebase = Comment & { _docId: string };

const SparrowPdfViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSparrowAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect if we're viewing a project or a single PDF
  const isProjectView = location.pathname.startsWith('/sparrow/project/');

  const [pdf, setPdf] = useState<PDF | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<CommentWithFirebase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentWithFirebase | null>(null);
  const [commentData, setCommentData] = useState<CommentData>({
    content: '',
    page_number: 1,
    x_position: 0,
    y_position: 0,
  });
  const [previewComment, setPreviewComment] = useState<{
    page_number: number;
    x_position: number;
    y_position: number;
  } | null>(null);
  const [error, setError] = useState('');
  const [showResolvedComments, setShowResolvedComments] = useState(false);

  // Track if we've done the initial version selection
  const hasSetInitialVersion = useRef(false);

  useEffect(() => {
    fetchPdfAndComments();
  }, [id, selectedVersion]);

  const fetchPdfAndComments = async () => {
    if (!id) return;

    try {
      setLoading(true);

      if (isProjectView && isLocalDevMode) {
        // Fetch project data in local dev mode
        const projectData = await mockProjectService.getById(id);
        if (!projectData) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        setProject(projectData);

        // Set the selected version to the latest on initial load only
        if (!hasSetInitialVersion.current && selectedVersion === 1 && projectData.current_version > 1) {
          setSelectedVersion(projectData.current_version);
          hasSetInitialVersion.current = true;
        }

        // Get the version to display
        const versionToDisplay = projectData.versions.find(v => v.version_number === selectedVersion);
        if (!versionToDisplay) {
          setError('Version not found');
          setLoading(false);
          return;
        }

        // Set the PDF URL from the version
        setPdfUrl(versionToDisplay.file_path);

        // Fetch comments for this specific version
        // Version ID format: ${projectId}_v${versionNumber}
        const versionId = `${id}_v${selectedVersion}`;
        const commentsData = await mockCommentService.getByPdf(versionId);
        setComments(commentsData);

      } else {
        // Fetch single PDF details (legacy mode or Firebase mode)
        const pdfData = await pdfService.getById(id);
        if (!pdfData) {
          setError('PDF not found');
          setLoading(false);
          return;
        }

        setPdf(pdfData);
        // Use Firebase download URL
        setPdfUrl(pdfData._downloadURL);

        // Fetch comments
        const commentsData = await commentService.getByPdf(id);
        setComments(commentsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load PDF');
      setLoading(false);
    }
  };

  const handleAddComment = (pageNumber: number, x: number, y: number) => {
    setCommentData({
      content: '',
      page_number: pageNumber,
      x_position: x,
      y_position: y,
    });
    // Create a preview comment marker
    setPreviewComment({
      page_number: pageNumber,
      x_position: x,
      y_position: y,
    });
    setSelectedComment(null);
    setShowCommentForm(true);
  };

  const handleCommentClick = (comment: Comment) => {
    setSelectedComment(comment);
    setPreviewComment(null); // Clear preview when editing existing comment
    setCommentData({
      content: comment.content,
      page_number: comment.page_number,
      x_position: comment.x_position,
      y_position: comment.y_position,
    });
    setShowCommentForm(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id || !user) return;

    try {
      // Determine the correct service and ID to use
      const service = isProjectView && isLocalDevMode ? mockCommentService : commentService;
      const pdfId = isProjectView && isLocalDevMode ? `${id}_v${selectedVersion}` : id;

      if (selectedComment) {
        // Update existing comment
        await service.update(selectedComment._docId, {
          content: commentData.content,
        });
      } else {
        // Create new comment
        await service.create(
          pdfId,
          commentData.content,
          commentData.page_number,
          commentData.x_position,
          commentData.y_position,
          user.email,
          user.name
        );
      }

      setShowCommentForm(false);
      setSelectedComment(null);
      setPreviewComment(null);
      setCommentData({ content: '', page_number: 1, x_position: 0, y_position: 0 });

      // Refresh comments
      const commentsData = await service.getByPdf(pdfId);
      setComments(commentsData);
    } catch (error: any) {
      console.error('Error saving comment:', error);
      setError(error.message || 'Failed to save comment');
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment || !id) return;

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        const service = isProjectView && isLocalDevMode ? mockCommentService : commentService;
        const pdfId = isProjectView && isLocalDevMode ? `${id}_v${selectedVersion}` : id;

        await service.delete(selectedComment._docId);
        setShowCommentForm(false);
        setSelectedComment(null);

        // Refresh comments
        const commentsData = await service.getByPdf(pdfId);
        setComments(commentsData);
      } catch (error: any) {
        console.error('Error deleting comment:', error);
        setError(error.message || 'Failed to delete comment');
      }
    }
  };

  const handleToggleResolved = async (comment: CommentWithFirebase) => {
    if (!id) return;

    try {
      const service = isProjectView && isLocalDevMode ? mockCommentService : commentService;
      const pdfId = isProjectView && isLocalDevMode ? `${id}_v${selectedVersion}` : id;

      await service.toggleResolved(comment._docId);

      // Refresh comments to get updated resolved status
      const commentsData = await service.getByPdf(pdfId);
      setComments(commentsData);
    } catch (error: any) {
      console.error('Error toggling resolved status:', error);
      setError(error.message || 'Failed to update comment status');
    }
  };

  const handleCommentMove = async (comment: CommentWithFirebase, x: number, y: number) => {
    if (!id) return;

    const service = isProjectView && isLocalDevMode ? mockCommentService : commentService;
    const pdfId = isProjectView && isLocalDevMode ? `${id}_v${selectedVersion}` : id;

    // Optimistically update the UI immediately
    setComments(prevComments =>
      prevComments.map(c =>
        c._docId === comment._docId
          ? { ...c, x_position: x, y_position: y }
          : c
      )
    );

    try {
      await service.update(comment._docId, {
        content: comment.content,
        x_position: x,
        y_position: y,
      });

      // Refresh comments to get the authoritative data
      const commentsData = await service.getByPdf(pdfId);
      setComments(commentsData);
    } catch (error: any) {
      console.error('Error moving comment:', error);
      setError(error.message || 'Failed to move comment');
      // Revert on error
      const commentsData = await service.getByPdf(pdfId);
      setComments(commentsData);
    }
  };

  const canEditComment = (comment: CommentWithFirebase) => {
    return comment.user_name === user?.name || comment.user_id === user?.id;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="loading-page">Loading...</div>;
  }

  return (
    <div className="pdf-viewer-page">
      <div className="viewer-header">
        <button className="btn-back" onClick={() => navigate('/sparrow/dashboard')}>
          <ArrowLeft className="inline h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <div className="header-title-section">
          <h2>
            {isProjectView ? project?.title : (pdf?.base_title || pdf?.title)}
            {!isProjectView && pdf?.version && <span className="version-badge">v{pdf?.version}</span>}
          </h2>
          {isProjectView && project && (
            <div className="version-selector">
              <label htmlFor="version-select">Version:</label>
              <select
                id="version-select"
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md bg-white"
              >
                {project.versions.map((version) => (
                  <option key={version.version_number} value={version.version_number}>
                    v{version.version_number} ({new Date(version.uploaded_at).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="header-info">
          {isProjectView && project
            ? `Created by ${project.created_by_name}`
            : `Uploaded by ${pdf?.uploader_name}`}
        </div>
      </div>

      <div className="viewer-content">
        <PdfThumbnails
          pdfDoc={pdfDoc}
          currentPage={currentPage}
          onPageClick={setCurrentPage}
          comments={comments}
          showResolvedComments={showResolvedComments}
        />

        <div className="pdf-section">
          {pdfUrl && (
            <PdfRenderer
              pdfUrl={pdfUrl}
              comments={comments}
              previewComment={previewComment}
              externalPage={currentPage}
              showResolvedComments={showResolvedComments}
              onAddComment={handleAddComment}
              onCommentClick={handleCommentClick}
              onToggleResolved={handleToggleResolved}
              onCommentMove={handleCommentMove}
              onPdfLoad={setPdfDoc}
              onPageChange={setCurrentPage}
            />
          )}
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h3>Comments ({showResolvedComments ? comments.length : comments.filter(c => !c.resolved).length})</h3>
            <button
              onClick={() => setShowResolvedComments(!showResolvedComments)}
              className="btn-filter"
              title={showResolvedComments ? "Hide resolved comments" : "Show all comments"}
            >
              {showResolvedComments ? 'Hide Resolved' : 'Show All'}
            </button>
          </div>

          {showCommentForm && (
            <div className="comment-form">
              <h4>{selectedComment ? 'Edit Comment' : 'Add Comment'}</h4>
              <form onSubmit={handleSubmitComment}>
                <textarea
                  value={commentData.content}
                  onChange={(e) =>
                    setCommentData({ ...commentData, content: e.target.value })
                  }
                  placeholder="Enter your comment..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />

                {error && <div className="error text-red-600 text-sm mt-2">{error}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {selectedComment ? 'Update' : 'Save'}
                  </button>
                  {selectedComment && canEditComment(selectedComment) && (
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={handleDeleteComment}
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowCommentForm(false);
                      setSelectedComment(null);
                      setPreviewComment(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="comments-list">
            {(() => {
              const filteredComments = showResolvedComments
                ? comments
                : comments.filter(c => !c.resolved);

              if (filteredComments.length === 0) {
                return <p className="no-comments">
                  {comments.length === 0
                    ? "No comments yet. Click on the PDF to add one!"
                    : "No unresolved comments. Click 'Show All' to see resolved comments."}
                </p>;
              }

              return filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`comment-item ${
                    selectedComment?.id === comment.id ? 'selected' : ''
                  } ${comment.resolved ? 'resolved' : ''}`}
                  onClick={() => handleCommentClick(comment)}
                >
                  <div className="comment-header">
                    <strong>{comment.user_name}</strong>
                    <span className="comment-page">Page {comment.page_number}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-date">{formatDate(comment.created_at)}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparrowPdfViewer;
