export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export interface PdfPageImage {
  id: string;
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}