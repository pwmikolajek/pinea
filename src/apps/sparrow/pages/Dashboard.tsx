import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSparrowAuth } from '../contexts/AuthContext';
import { pdfService } from '../services/firebaseService';
import { mockProjectService } from '../services/mockDataService';
import { isLocalDevMode } from '../config/localDev';
import { PDF, Project } from '../types';
import logo from '../../../core/assets/logo.svg';
import './Dashboard.css';

type PDFWithFirebase = PDF & { _docId: string; _downloadURL: string };

const SparrowDashboard: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFWithFirebase[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [uploadingVersionForProject, setUploadingVersionForProject] = useState<string>('');

  const { user, logout } = useSparrowAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (isLocalDevMode) {
        const fetchedProjects = await mockProjectService.getAll();
        setProjects(fetchedProjects);
      } else {
        const fetchedPdfs = await pdfService.getAll();
        setPdfs(fetchedPdfs);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
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

    if (!file || !title || !user) {
      setError('Please provide both title and file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      if (isLocalDevMode) {
        // Create new project
        await mockProjectService.create(file, title, user.email, user.name);
      } else {
        await pdfService.upload(file, title, user.email, user.name);
      }
      setTitle('');
      setFile(null);
      setShowUploadForm(false);
      fetchData();
    } catch (error: any) {
      setError(error.message || 'Failed to upload PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        await pdfService.delete(docId);
        fetchData();
      } catch (error) {
        console.error('Error deleting PDF:', error);
        alert('Failed to delete PDF');
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project and all its versions?')) {
      try {
        await mockProjectService.delete(projectId);
        fetchData();
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
  };

  const handleVersionFileChange = async (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf' && user) {
      setUploadingVersionForProject(projectId);
      setError('');
      try {
        await mockProjectService.addVersion(projectId, selectedFile, user.email, user.name);
        fetchData();
      } catch (error: any) {
        setError(error.message || 'Failed to upload new version');
        alert(error.message || 'Failed to upload new version');
      } finally {
        setUploadingVersionForProject('');
        // Reset the file input
        e.target.value = '';
      }
    } else if (selectedFile) {
      alert('Please select a PDF file');
      e.target.value = '';
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
            className="inline-flex items-center text-[#2E822E] hover:text-[#257525] transition-colors"
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
            <h2 className="text-xl font-medium text-gray-900">My Projects</h2>
            <button
              onClick={() => {
                setShowUploadForm(!showUploadForm);
                setTitle('');
                setFile(null);
                setError('');
              }}
              className="px-4 py-2 bg-[#2E822E] text-white text-sm font-medium rounded-md hover:bg-[#257525] transition-colors"
            >
              {showUploadForm ? 'Cancel' : 'New Project'}
            </button>
          </div>

          {showUploadForm && (
            <div className="upload-form">
              <h3>Create New Project</h3>
              <form onSubmit={handleUpload}>
                <div className="form-group">
                  <label htmlFor="title">Project Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter project title"
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
                  className="mt-4 px-4 py-2 bg-[#2E822E] text-white rounded-md hover:bg-[#257525] disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Creating...' : 'Create Project'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="loading">Loading...</div>
          ) : isLocalDevMode ? (
            projects.length === 0 ? (
              <div className="no-pdfs">
                <p>No projects yet. Upload your first PDF to create a project!</p>
              </div>
            ) : (
              <div className="pdf-grid">
                {projects.map((project) => {
                  const latestVersion = project.versions[project.versions.length - 1];
                  return (
                    <div key={project.id} className="pdf-card">
                      <div className="pdf-card-header">
                        <h3>
                          {project.title}
                          <span className="version-badge">v{project.current_version}</span>
                        </h3>
                        <button
                          className="btn-delete-icon"
                          onClick={() => handleDeleteProject(project.id)}
                          title="Delete project"
                        >
                          ×
                        </button>
                      </div>
                      <div className="pdf-card-body">
                        <p className="pdf-info">
                          <strong>Created by:</strong> {project.created_by_name}
                        </p>
                        <p className="pdf-info">
                          <strong>Last updated:</strong> {formatDate(latestVersion.uploaded_at)}
                        </p>
                        <p className="pdf-info">
                          <strong>Versions:</strong> {project.versions.length}
                        </p>
                      </div>
                      <div className="pdf-card-actions">
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/sparrow/project/${project.id}`)}
                        >
                          View & Comment
                        </button>
                        <label
                          className="btn-upload-version"
                          title="Upload new version"
                        >
                          {uploadingVersionForProject === project.id ? 'Uploading...' : 'Upload Version'}
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleVersionFileChange(project.id, e)}
                            disabled={uploadingVersionForProject === project.id}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            pdfs.length === 0 ? (
              <div className="no-pdfs">
                <p>No PDFs uploaded yet. Upload your first PDF to get started!</p>
              </div>
            ) : (
              <div className="pdf-grid">
                {pdfs.map((pdf) => (
                  <div key={pdf._docId} className="pdf-card">
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
                    </div>
                    <div className="pdf-card-actions">
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/sparrow/pdf/${pdf._docId}`)}
                      >
                        View & Comment
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(pdf._docId)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SparrowDashboard;
