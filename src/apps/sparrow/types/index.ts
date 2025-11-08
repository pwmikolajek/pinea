export interface User {
  id: number;
  email: string;
  name: string;
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
}

export interface CommentData {
  content: string;
  page_number: number;
  x_position: number;
  y_position: number;
}
