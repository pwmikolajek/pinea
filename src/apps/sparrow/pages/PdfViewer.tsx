import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSparrowAuth } from '../contexts/AuthContext';
import { pdfAPI, commentAPI } from '../services/api';
import PdfRenderer from '../components/PdfRenderer';
import PdfThumbnails from '../components/PdfThumbnails';
import { PDF, Comment, CommentData } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import './PdfViewer.css';

const SparrowPdfViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useSparrowAuth();
  const navigate = useNavigate();

  const [pdf, setPdf] = useState<PDF | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
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

  useEffect(() => {
    fetchPdfAndComments();
  }, [id]);

  const fetchPdfAndComments = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Fetch PDF details
      const pdfResponse = await pdfAPI.getById(id);
      setPdf(pdfResponse.data);

      // Set PDF URL for viewer
      const token = localStorage.getItem('sparrow_token');
      const baseUrl =
        import.meta.env.VITE_SPARROW_API_URL || 'http://localhost:5000/api';
      setPdfUrl(`${baseUrl}/pdfs/${id}/download?token=${token}`);

      // Fetch comments
      const commentsResponse = await commentAPI.getByPdf(id);
      setComments(commentsResponse.data || []);

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

    if (!id) return;

    try {
      if (selectedComment) {
        // Update existing comment
        await commentAPI.update(selectedComment.id, {
          content: commentData.content,
        });
      } else {
        // Create new comment
        await commentAPI.create({
          pdf_id: parseInt(id),
          ...commentData,
        });
      }

      setShowCommentForm(false);
      setSelectedComment(null);
      setPreviewComment(null);
      setCommentData({ content: '', page_number: 1, x_position: 0, y_position: 0 });

      // Only fetch comments, not the entire PDF data
      const commentsResponse = await commentAPI.getByPdf(id);
      setComments(commentsResponse.data || []);
    } catch (error: any) {
      console.error('Error saving comment:', error);
      setError(error.response?.data?.error || 'Failed to save comment');
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment || !id) return;

    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentAPI.delete(selectedComment.id);
        setShowCommentForm(false);
        setSelectedComment(null);

        // Only fetch comments, not the entire PDF data
        const commentsResponse = await commentAPI.getByPdf(id);
        setComments(commentsResponse.data || []);
      } catch (error: any) {
        console.error('Error deleting comment:', error);
        setError(error.response?.data?.error || 'Failed to delete comment');
      }
    }
  };

  const handleToggleResolved = async (commentId: number) => {
    if (!id) return;

    try {
      await commentAPI.toggleResolved(commentId);

      // Refresh comments to get updated resolved status
      const commentsResponse = await commentAPI.getByPdf(id);
      setComments(commentsResponse.data || []);
    } catch (error: any) {
      console.error('Error toggling resolved status:', error);
      setError(error.response?.data?.error || 'Failed to update comment status');
    }
  };

  const handleCommentMove = async (comment: Comment, x: number, y: number) => {
    if (!id) return;

    // Optimistically update the UI immediately
    setComments(prevComments =>
      prevComments.map(c =>
        c.id === comment.id
          ? { ...c, x_position: x, y_position: y }
          : c
      )
    );

    try {
      await commentAPI.update(comment.id, {
        content: comment.content,
        x_position: x,
        y_position: y,
      });

      // Refresh comments to get the authoritative data from backend
      const commentsResponse = await commentAPI.getByPdf(id);
      setComments(commentsResponse.data || []);
    } catch (error: any) {
      console.error('Error moving comment:', error);
      setError(error.response?.data?.error || 'Failed to move comment');
      // Revert on error
      const commentsResponse = await commentAPI.getByPdf(id);
      setComments(commentsResponse.data || []);
    }
  };

  const canEditComment = (comment: Comment) => {
    return comment.user_id === user?.id;
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
        <h2>
          {pdf?.base_title || pdf?.title}
          {pdf?.version && <span className="version-badge">v{pdf?.version}</span>}
        </h2>
        <div className="header-info">Uploaded by {pdf?.uploader_name}</div>
      </div>

      <div className="viewer-content">
        <PdfThumbnails
          pdfDoc={pdfDoc}
          currentPage={currentPage}
          onPageClick={setCurrentPage}
          comments={comments}
        />

        <div className="pdf-section">
          {pdfUrl && (
            <PdfRenderer
              pdfUrl={pdfUrl}
              comments={comments}
              previewComment={previewComment}
              externalPage={currentPage}
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
          <h3>Comments ({comments.length})</h3>

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
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Click on the PDF to add one!</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`comment-item ${
                    selectedComment?.id === comment.id ? 'selected' : ''
                  }`}
                  onClick={() => handleCommentClick(comment)}
                >
                  <div className="comment-header">
                    <strong>{comment.user_name}</strong>
                    <span className="comment-page">Page {comment.page_number}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                  <div className="comment-date">{formatDate(comment.created_at)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparrowPdfViewer;
