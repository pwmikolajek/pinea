import { LOCAL_STORAGE_KEYS } from '../config/localDev';
import { PDF, Comment, Project, PDFVersion } from '../types';

// In-memory storage for PDF file objects (to avoid localStorage quota issues)
const pdfFilesCache = new Map<string, string>();

// Helper functions for localStorage
const getPdfsFromStorage = (): (PDF & { _docId: string; _downloadURL: string })[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.PDFS);
  return data ? JSON.parse(data) : [];
};

const savePdfsToStorage = (pdfs: (PDF & { _docId: string; _downloadURL: string })[]) => {
  // Only save metadata, not the actual file data
  const metadata = pdfs.map(pdf => ({
    ...pdf,
    file_path: pdf._docId, // Store docId as reference
    _downloadURL: pdf._docId, // Store docId as reference
  }));
  localStorage.setItem(LOCAL_STORAGE_KEYS.PDFS, JSON.stringify(metadata));
};

const getCommentsFromStorage = (): (Comment & { _docId: string })[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.COMMENTS);
  return data ? JSON.parse(data) : [];
};

const saveCommentsToStorage = (comments: (Comment & { _docId: string })[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
};

const getProjectsFromStorage = (): Project[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEYS.PROJECTS);
  return data ? JSON.parse(data) : [];
};

const saveProjectsToStorage = (projects: Project[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock PDF Service
export const mockPdfService = {
  upload: async (file: File, title: string, userId: string, userName: string): Promise<PDF & { _docId: string; _downloadURL: string }> => {
    // Create a data URL from the file
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    const docId = generateId();

    // Store the file data in memory cache to avoid localStorage quota issues
    pdfFilesCache.set(docId, dataUrl);

    const pdf: PDF & { _docId: string; _downloadURL: string } = {
      id: parseInt(docId.substring(0, 8), 36),
      title,
      filename: file.name,
      uploader_id: parseInt(userId),
      uploader_name: userName,
      file_path: docId, // Store reference instead of actual data
      created_at: new Date().toISOString(),
      _docId: docId,
      _downloadURL: docId, // Store reference instead of actual data
    };

    const pdfs = getPdfsFromStorage();
    pdfs.unshift(pdf);
    savePdfsToStorage(pdfs);

    return pdf;
  },

  getAll: async (): Promise<(PDF & { _docId: string; _downloadURL: string })[]> => {
    const pdfs = getPdfsFromStorage();
    // Restore the actual file URLs from cache
    return pdfs.map(pdf => ({
      ...pdf,
      file_path: pdfFilesCache.get(pdf._docId) || pdf.file_path,
      _downloadURL: pdfFilesCache.get(pdf._docId) || pdf._downloadURL,
    }));
  },

  getById: async (docId: string): Promise<(PDF & { _docId: string; _downloadURL: string }) | null> => {
    const pdfs = getPdfsFromStorage();
    const pdf = pdfs.find(pdf => pdf._docId === docId);
    if (!pdf) return null;

    // Restore the actual file URL from cache
    return {
      ...pdf,
      file_path: pdfFilesCache.get(docId) || pdf.file_path,
      _downloadURL: pdfFilesCache.get(docId) || pdf._downloadURL,
    };
  },

  delete: async (docId: string): Promise<void> => {
    // Delete PDF from cache
    pdfFilesCache.delete(docId);

    // Delete PDF metadata
    const pdfs = getPdfsFromStorage().filter(pdf => pdf._docId !== docId);
    savePdfsToStorage(pdfs);

    // Delete associated comments
    const comments = getCommentsFromStorage().filter(comment => comment.pdf_id !== parseInt(docId.substring(0, 8), 36));
    saveCommentsToStorage(comments);
  },
};

// Mock Comment Service
export const mockCommentService = {
  create: async (
    pdfDocId: string,
    content: string,
    pageNumber: number,
    xPosition: number,
    yPosition: number,
    userId: string,
    userName: string
  ): Promise<Comment & { _docId: string }> => {
    const docId = generateId();
    const comment: Comment & { _docId: string } = {
      id: parseInt(docId.substring(0, 8), 36),
      pdf_id: parseInt(pdfDocId.substring(0, 8), 36),
      user_id: parseInt(userId),
      user_name: userName,
      content,
      page_number: pageNumber,
      x_position: xPosition,
      y_position: yPosition,
      resolved: false,
      created_at: new Date().toISOString(),
      _docId: docId,
    };

    const comments = getCommentsFromStorage();
    comments.push(comment);
    saveCommentsToStorage(comments);

    return comment;
  },

  getByPdf: async (pdfDocId: string): Promise<(Comment & { _docId: string })[]> => {
    const comments = getCommentsFromStorage();
    const pdfId = parseInt(pdfDocId.substring(0, 8), 36);
    return comments.filter(comment => comment.pdf_id === pdfId);
  },

  update: async (
    docId: string,
    updates: { content?: string; x_position?: number; y_position?: number }
  ): Promise<void> => {
    const comments = getCommentsFromStorage();
    const index = comments.findIndex(comment => comment._docId === docId);

    if (index !== -1) {
      comments[index] = { ...comments[index], ...updates };
      saveCommentsToStorage(comments);
    }
  },

  toggleResolved: async (docId: string): Promise<void> => {
    const comments = getCommentsFromStorage();
    const index = comments.findIndex(comment => comment._docId === docId);

    if (index !== -1) {
      comments[index].resolved = !comments[index].resolved;
      saveCommentsToStorage(comments);
    }
  },

  delete: async (docId: string): Promise<void> => {
    const comments = getCommentsFromStorage().filter(comment => comment._docId !== docId);
    saveCommentsToStorage(comments);
  },
};

// Mock Project Service
export const mockProjectService = {
  // Create a new project with initial PDF version
  create: async (
    file: File,
    title: string,
    userId: string,
    userName: string
  ): Promise<Project> => {
    // Create a data URL from the file
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    const projectId = generateId();
    const versionId = `${projectId}_v1`;

    // Store the file data in memory cache
    pdfFilesCache.set(versionId, dataUrl);

    const project: Project = {
      id: projectId,
      title,
      created_at: new Date().toISOString(),
      created_by: userId,
      created_by_name: userName,
      current_version: 1,
      versions: [
        {
          version_number: 1,
          filename: file.name,
          file_path: versionId,
          uploaded_at: new Date().toISOString(),
          uploaded_by: userId,
          uploaded_by_name: userName,
          comment_count: 0,
        },
      ],
    };

    const projects = getProjectsFromStorage();
    projects.unshift(project);
    saveProjectsToStorage(projects);

    return project;
  },

  // Add a new version to an existing project
  addVersion: async (
    projectId: string,
    file: File,
    userId: string,
    userName: string
  ): Promise<Project> => {
    // Create a data URL from the file
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });

    const projects = getProjectsFromStorage();
    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const project = projects[projectIndex];
    const newVersionNumber = project.current_version + 1;
    const versionId = `${projectId}_v${newVersionNumber}`;

    // Store the file data in memory cache
    pdfFilesCache.set(versionId, dataUrl);

    const newVersion: PDFVersion = {
      version_number: newVersionNumber,
      filename: file.name,
      file_path: versionId,
      uploaded_at: new Date().toISOString(),
      uploaded_by: userId,
      uploaded_by_name: userName,
      comment_count: 0,
    };

    project.versions.push(newVersion);
    project.current_version = newVersionNumber;

    projects[projectIndex] = project;
    saveProjectsToStorage(projects);

    return project;
  },

  // Get all projects
  getAll: async (): Promise<Project[]> => {
    const projects = getProjectsFromStorage();

    // Restore file URLs from cache for all versions
    return projects.map((project) => ({
      ...project,
      versions: project.versions.map((version) => ({
        ...version,
        file_path: pdfFilesCache.get(version.file_path) || version.file_path,
      })),
    }));
  },

  // Get a specific project by ID
  getById: async (projectId: string): Promise<Project | null> => {
    const projects = getProjectsFromStorage();
    const project = projects.find((p) => p.id === projectId);

    if (!project) return null;

    // Restore file URLs from cache for all versions
    return {
      ...project,
      versions: project.versions.map((version) => ({
        ...version,
        file_path: pdfFilesCache.get(version.file_path) || version.file_path,
      })),
    };
  },

  // Delete a project and all its versions
  delete: async (projectId: string): Promise<void> => {
    const projects = getProjectsFromStorage();
    const project = projects.find((p) => p.id === projectId);

    if (project) {
      // Delete all version files from cache
      project.versions.forEach((version) => {
        pdfFilesCache.delete(version.file_path);
      });

      // Delete all comments for this project
      const comments = getCommentsFromStorage();
      const projectVersionIds = project.versions.map((v) => parseInt(v.file_path.substring(0, 8), 36));
      const filteredComments = comments.filter(
        (comment) => !projectVersionIds.includes(comment.pdf_id)
      );
      saveCommentsToStorage(filteredComments);

      // Remove project
      const filteredProjects = projects.filter((p) => p.id !== projectId);
      saveProjectsToStorage(filteredProjects);
    }
  },
};
