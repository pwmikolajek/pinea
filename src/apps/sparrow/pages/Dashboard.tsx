import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSparrowAuth } from '../contexts/AuthContext';
import { pdfAPI } from '../services/api';
import { PDF } from '../types';
import logo from '../../../img/logo.svg';
import './Dashboard.css';

const SparrowDashboard: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const { user, logout } = useSparrowAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPdfs();
  }, []);

  const fetchPdfs = async () => {
    try {
      const response = await pdfAPI.getAll();
      setPdfs(response.data.pdfs);
    } catch (error: any) {
      console.error('Error fetching PDFs:', error);
      setError('Failed to fetch PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      // Auto-populate title from filename (remove .pdf extension and version number)
      let filename = selectedFile.name.replace(/\.pdf$/i, '');

      // Strip version number (e.g., "Title v4" becomes "Title")
      const versionMatch = filename.match(/(.+?)\s+v(?:ersion)?\s*\d+$/i);
      if (versionMatch) {
        filename = versionMatch[1].trim();
      }

      setTitle(filename);
      setError('');
    } else {
      setFile(null);
      setError('Please select a PDF file');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title) {
      setError('Please provide both title and file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);

    try {
      await pdfAPI.upload(formData);
      setTitle('');
      setFile(null);
      setShowUploadForm(false);
      fetchPdfs();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        await pdfAPI.delete(String(id));
        fetchPdfs();
      } catch (error) {
        console.error('Error deleting PDF:', error);
        alert('Failed to delete PDF');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-grid">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-[#6C6A63] hover:text-[#3C3A33] transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Apps
          </button>

          <h1 className="text-2xl font-medium text-[#6C6A63]">PDF Commenting</h1>

          <div className="flex items-center gap-4">
            <span className="text-[#6C6A63]">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-[#6C6A63] bg-white hover:bg-gray-50"
            >
              Logout
            </button>
            <img src={logo} alt="Pinea Logo" className="h-8" />
          </div>
        </div>

        <div className="rounded-[15px] border border-[rgba(108,106,99,0.10)] bg-[#F9F8F6] shadow-[0px_100px_80px_0px_rgba(108,106,99,0.02)] p-6">
          <div className="dashboard-header">
            <h2 className="text-xl font-medium text-gray-900">My PDFs</h2>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              {showUploadForm ? 'Cancel' : 'Upload PDF'}
            </button>
          </div>

          {showUploadForm && (
            <div className="upload-form">
              <h3>Upload New PDF</h3>
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="file">PDF File</label>
                  <input
                    type="file"
                    id="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    disabled={uploading}
                    className="w-full"
                  />
                </div>

                {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading PDFs...</div>
          ) : pdfs.length === 0 ? (
            <div className="no-pdfs">
              <p>No PDFs uploaded yet. Upload your first PDF to get started!</p>
            </div>
          ) : (
            <div className="pdf-grid">
              {pdfs.map((pdf) => (
                <div key={pdf.id} className="pdf-card">
                  <div className="pdf-card-header">
                    <h3>
                      {pdf.base_title || pdf.title}
                      {pdf.version && <span className="version-badge">v{pdf.version}</span>}
                    </h3>
                  </div>
                  <div className="pdf-card-body">
                    <p className="pdf-info">
                      <strong>Uploaded by:</strong> {pdf.uploader_name}
                    </p>
                    <p className="pdf-info">
                      <strong>Date:</strong> {formatDate(pdf.created_at)}
                    </p>
                    <p className="pdf-info">
                      <strong>File:</strong> {pdf.filename}
                    </p>
                  </div>
                  <div className="pdf-card-actions">
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/sparrow/pdf/${pdf.id}`)}
                    >
                      View & Comment
                    </button>
                    {pdf.uploader_id === user?.id && (
                      <button className="btn-delete" onClick={() => handleDelete(pdf.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SparrowDashboard;
