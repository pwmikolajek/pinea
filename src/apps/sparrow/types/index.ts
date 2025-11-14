export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
  created_by_name: string;
  current_version: number;
  versions: PDFVersion[];
}

export interface PDFVersion {
  version_number: number;
  filename: string;
  file_path: string;
  uploaded_at: string;
  uploaded_by: string;
  uploaded_by_name: string;
  comment_count?: number;
}

export interface PDF {
  id: number;
  title: string;
  base_title?: string;
  version?: number;
  filename: string;
  uploader_id: number;
  uploader_name: string;
  file_path: string;
  created_at: string;
  project_id?: string;
}

export interface Comment {
  id: number;
  pdf_id: number;
  user_id: number;
  user_name: string;
  content: string;
  page_number: number;
  x_position: number;
  y_position: number;
  resolved?: boolean;
  created_at: string;
  version_number?: number;
}

export interface CommentData {
  content: string;
  page_number: number;
  x_position: number;
  y_position: number;
}
